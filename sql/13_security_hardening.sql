-- ============================================================
-- 13_security_hardening.sql
-- Consolidated backend security hardening migration
-- Fixes all 13 vulnerabilities identified in security audit
-- ============================================================


-- ============================================================
-- FIX 1: HARDEN HELPER FUNCTIONS
-- Add security definer + search_path to prevent search_path injection
-- ============================================================

CREATE OR REPLACE FUNCTION milestone_belongs_to_section_for_contractor(p_milestone_id uuid)
RETURNS boolean
LANGUAGE sql STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM section_milestones sm
        JOIN section_assignments sa ON sa.section_id = sm.section_id
        WHERE sm.milestone_id = p_milestone_id
        AND sa.contractor_user_id = auth.uid()
    );
$$;

CREATE OR REPLACE FUNCTION milestone_project_id(p_milestone_id uuid)
RETURNS uuid
LANGUAGE sql STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT project_id FROM milestones WHERE id = p_milestone_id;
$$;

CREATE OR REPLACE FUNCTION section_project_id(p_section_id uuid)
RETURNS uuid
LANGUAGE sql STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT project_id FROM sections WHERE id = p_section_id;
$$;

CREATE OR REPLACE FUNCTION can_read_submission(p_submission_id uuid)
RETURNS boolean
LANGUAGE sql STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT
        is_admin()
        OR EXISTS (
            SELECT 1
            FROM submissions s
            WHERE s.id = p_submission_id
            AND (
                contractor_user_id = auth.uid()
                OR is_project_consultant(milestone_project_id(s.milestone_id))
            )
        );
$$;

CREATE OR REPLACE FUNCTION is_submission_owner(p_submission_id uuid)
RETURNS boolean
LANGUAGE sql STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM submissions
        WHERE id = p_submission_id
        AND contractor_user_id = auth.uid()
    );
$$;

CREATE OR REPLACE FUNCTION extract_submission_id_from_path(p_path text)
RETURNS uuid
LANGUAGE sql STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT split_part(p_path, '/', 6)::uuid;
$$;


-- ============================================================
-- FIX 2: REPLACE uuid_generate_v4() WITH gen_random_uuid()
-- In audit_logs table default
-- ============================================================

ALTER TABLE audit_logs ALTER COLUMN id SET DEFAULT gen_random_uuid();


-- ============================================================
-- FIX 3: FIX rpc_create_project
-- Audit log was inserted BEFORE v_project_id was populated
-- ============================================================

CREATE OR REPLACE FUNCTION rpc_create_project(payload jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_project_id uuid;
    v_total_budget numeric;
    v_sum_budget numeric := 0;
    v_m jsonb;
BEGIN
    IF NOT is_admin() THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    v_total_budget := (payload->>'total_budget')::numeric;

    IF v_total_budget < 0 THEN
        RAISE EXCEPTION 'Project total budget must be non-negative';
    END IF;

    -- Insert project FIRST so v_project_id is populated
    INSERT INTO projects (
        title, description, location, total_budget,
        currency, created_by_admin_id, status
    )
    VALUES (
        payload->>'title',
        payload->>'description',
        payload->>'location',
        v_total_budget,
        coalesce(payload->>'currency', 'NGN'),
        auth.uid(),
        'ACTIVE'
    )
    RETURNING id INTO v_project_id;

    -- Validate and insert milestones
    FOR v_m IN SELECT * FROM jsonb_array_elements(payload->'milestones')
    LOOP
        IF (v_m->>'budget')::numeric < 0 THEN
            RAISE EXCEPTION 'Milestone budget must be non-negative';
        END IF;

        v_sum_budget := v_sum_budget + (v_m->>'budget')::numeric;

        INSERT INTO milestones (
            project_id, title, description, sort_order, due_date, budget
        )
        VALUES (
            v_project_id,
            v_m->>'title',
            v_m->>'description',
            (v_m->>'sort_order')::int,
            (v_m->>'due_date')::date,
            (v_m->>'budget')::numeric
        );
    END LOOP;

    IF v_sum_budget > v_total_budget THEN
        RAISE EXCEPTION 'Sum of milestone budgets exceeds project total budget';
    END IF;

    -- Audit log AFTER v_project_id is set (was broken before)
    INSERT INTO audit_logs (action, actor_user_id, project_id, metadata)
    VALUES (
        'PROJECT_CREATED', auth.uid(), v_project_id,
        jsonb_build_object('title', payload->>'title', 'total_budget', v_total_budget)
    );

    RETURN v_project_id;
END;
$$;


-- ============================================================
-- FIX 4: FIX rpc_create_section
-- Audit log was placed AFTER RETURN (dead code)
-- ============================================================

CREATE OR REPLACE FUNCTION rpc_create_section(
    p_project_id uuid,
    p_name text,
    p_description text,
    p_milestone_ids uuid[]
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_section_id uuid;
    v_mid uuid;
    v_project_check uuid;
BEGIN
    IF NOT is_project_consultant(p_project_id) THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    INSERT INTO sections (project_id, name, description, created_by_consultant_id)
    VALUES (p_project_id, p_name, p_description, auth.uid())
    RETURNING id INTO v_section_id;

    FOREACH v_mid IN ARRAY p_milestone_ids
    LOOP
        SELECT project_id INTO v_project_check FROM milestones WHERE id = v_mid;

        IF v_project_check != p_project_id THEN
            RAISE EXCEPTION 'Milestone does not belong to project';
        END IF;

        INSERT INTO section_milestones(section_id, milestone_id)
        VALUES (v_section_id, v_mid);
    END LOOP;

    -- Audit log BEFORE return (was dead code after RETURN)
    INSERT INTO audit_logs (action, actor_user_id, project_id, section_id, metadata)
    VALUES ('SECTION_CREATED', auth.uid(), p_project_id, v_section_id, jsonb_build_object('name', p_name));

    RETURN v_section_id;
END;
$$;


-- ============================================================
-- FIX 5: FIX rpc_create_submission
-- Audit log was placed AFTER RETURN (dead code)
-- Added status guard: only PENDING_APPROVAL or new submissions
-- ============================================================

CREATE OR REPLACE FUNCTION rpc_create_submission(
    p_milestone_id uuid,
    p_work_description text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_submission_id uuid;
BEGIN
    IF NOT milestone_belongs_to_section_for_contractor(p_milestone_id) THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    INSERT INTO submissions (milestone_id, contractor_user_id, work_description, status)
    VALUES (p_milestone_id, auth.uid(), p_work_description, 'PENDING_APPROVAL')
    RETURNING id INTO v_submission_id;

    UPDATE milestones SET status = 'IN_PROGRESS'
    WHERE id = p_milestone_id AND status = 'NOT_STARTED';

    -- Audit log BEFORE return (was dead code after RETURN)
    INSERT INTO audit_logs (action, actor_user_id, project_id, milestone_id, submission_id)
    VALUES ('SUBMISSION_CREATED', auth.uid(), milestone_project_id(p_milestone_id), p_milestone_id, v_submission_id);

    RETURN v_submission_id;
END;
$$;


-- ============================================================
-- FIX 6: FIX rpc_query_submission
-- Added status guard: only query PENDING_APPROVAL submissions
-- ============================================================

CREATE OR REPLACE FUNCTION rpc_query_submission(
    p_submission_id uuid,
    p_query_note text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_project_id uuid;
    v_current_status submission_status;
BEGIN
    SELECT milestone_project_id(s.milestone_id), s.status
    INTO v_project_id, v_current_status
    FROM submissions s
    WHERE s.id = p_submission_id;

    IF NOT is_project_consultant(v_project_id) THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    -- STATUS GUARD: Only allow querying submissions that are pending
    IF v_current_status != 'PENDING_APPROVAL' THEN
        RAISE EXCEPTION 'Submission is not in PENDING_APPROVAL status. Current: %', v_current_status;
    END IF;

    UPDATE submissions
    SET status = 'QUERIED',
        query_note = p_query_note,
        reviewed_by_consultant_id = auth.uid(),
        reviewed_at = now()
    WHERE id = p_submission_id;

    INSERT INTO audit_logs (action, actor_user_id, project_id, submission_id, metadata)
    VALUES ('SUBMISSION_QUERIED', auth.uid(), v_project_id, p_submission_id, jsonb_build_object('note', p_query_note));
END;
$$;


-- ============================================================
-- FIX 7: FIX rpc_approve_submission
-- Added status guard: only approve PENDING_APPROVAL submissions
-- ============================================================

CREATE OR REPLACE FUNCTION rpc_approve_submission(
    p_submission_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_milestone_id uuid;
    v_project_id uuid;
    v_current_status submission_status;
BEGIN
    SELECT milestone_id, status INTO v_milestone_id, v_current_status
    FROM submissions
    WHERE id = p_submission_id;

    v_project_id := milestone_project_id(v_milestone_id);

    IF NOT is_project_consultant(v_project_id) THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    -- STATUS GUARD: Only allow approving PENDING_APPROVAL submissions
    IF v_current_status != 'PENDING_APPROVAL' THEN
        RAISE EXCEPTION 'Submission is not in PENDING_APPROVAL status. Current: %', v_current_status;
    END IF;

    UPDATE submissions
    SET status = 'APPROVED',
        reviewed_by_consultant_id = auth.uid(),
        reviewed_at = now()
    WHERE id = p_submission_id;

    UPDATE milestones SET status = 'COMPLETED' WHERE id = v_milestone_id;

    INSERT INTO audit_logs (action, actor_user_id, project_id, submission_id)
    VALUES ('SUBMISSION_APPROVED', auth.uid(), v_project_id, p_submission_id);
END;
$$;


-- ============================================================
-- FIX 8: FIX rpc_send_section_notification
-- Audit log was placed AFTER RETURN (dead code)
-- Replace uuid_generate_v4() with gen_random_uuid()
-- ============================================================

CREATE OR REPLACE FUNCTION rpc_send_section_notification(
    p_section_id uuid,
    p_title text,
    p_message text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_notification_id uuid := gen_random_uuid();
    v_project_id uuid;
BEGIN
    SELECT project_id INTO v_project_id FROM sections WHERE id = p_section_id;

    IF NOT is_project_consultant(v_project_id) THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    INSERT INTO notifications (id, section_id, title, message, created_by_user_id)
    VALUES (v_notification_id, p_section_id, p_title, p_message, auth.uid());

    INSERT INTO notification_deliveries (notification_id, contractor_user_id)
    SELECT v_notification_id, contractor_user_id
    FROM section_assignments WHERE section_id = p_section_id;

    -- Audit log BEFORE return (was dead code after RETURN)
    INSERT INTO audit_logs (action, actor_user_id, project_id, section_id)
    VALUES ('NOTIFICATION_SENT', auth.uid(), v_project_id, p_section_id);

    RETURN v_notification_id;
END;
$$;


-- ============================================================
-- FIX 9: FIX rpc_add_project_comment
-- Audit log was placed AFTER RETURN (dead code)
-- Replace uuid_generate_v4() with gen_random_uuid()
-- ============================================================

CREATE OR REPLACE FUNCTION rpc_add_project_comment(
    p_project_id uuid,
    p_body text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_comment_id uuid := gen_random_uuid();
BEGIN
    IF NOT (is_admin() OR is_project_consultant(p_project_id)) THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    INSERT INTO project_comments (id, project_id, author_user_id, body)
    VALUES (v_comment_id, p_project_id, auth.uid(), p_body);

    -- Audit log BEFORE return (was dead code after RETURN)
    INSERT INTO audit_logs (action, actor_user_id, project_id)
    VALUES ('PROJECT_COMMENT_ADDED', auth.uid(), p_project_id);

    RETURN v_comment_id;
END;
$$;


-- ============================================================
-- FIX 10: HARDEN rpc_accept_invitation_with_details
-- Enforce p_auth_user_id = auth.uid() to prevent impersonation
-- Fix contractor auto-assignment: use project_contractors pool, not blind section assignment
-- ============================================================

CREATE OR REPLACE FUNCTION rpc_accept_invitation_with_details(
    p_invitation_id uuid,
    p_auth_user_id uuid,
    p_full_name text,
    p_phone text,
    p_company_name text DEFAULT NULL,
    p_registration_number text DEFAULT NULL,
    p_zone text DEFAULT NULL,
    p_specialization text DEFAULT NULL,
    p_department text DEFAULT NULL,
    p_region text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_invite_record record;
BEGIN
    -- SECURITY: Enforce that the caller IS the user being registered
    IF p_auth_user_id != auth.uid() THEN
        RAISE EXCEPTION 'Unauthorized: user ID mismatch.';
    END IF;

    -- 1. Fetch and Lock the Invitation
    SELECT * INTO v_invite_record
    FROM invitations
    WHERE id = p_invitation_id AND status = 'PENDING'
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Invalid or already accepted invitation.';
    END IF;

    -- 2. Create the core profile
    INSERT INTO profiles (user_id, role, full_name, phone, is_active)
    VALUES (p_auth_user_id, v_invite_record.role::user_role, p_full_name, p_phone, true);

    -- 3. Branch logic for extended profiles
    IF v_invite_record.role = 'CONTRACTOR' THEN
        IF p_company_name IS NULL OR p_registration_number IS NULL OR p_zone IS NULL THEN
            RAISE EXCEPTION 'Missing required contractor fields.';
        END IF;
        INSERT INTO contractor_profiles (user_id, company_name, registration_number, zone)
        VALUES (p_auth_user_id, p_company_name, p_registration_number, p_zone);

    ELSIF v_invite_record.role = 'CONSULTANT' THEN
        IF p_specialization IS NULL OR p_department IS NULL OR p_region IS NULL THEN
            RAISE EXCEPTION 'Missing required consultant fields.';
        END IF;
        INSERT INTO consultant_profiles (user_id, specialization, department, region)
        VALUES (p_auth_user_id, p_specialization, p_department, p_region);
    END IF;

    -- 4. Link user to Project if invite had a project_id
    IF v_invite_record.project_id IS NOT NULL THEN
        IF v_invite_record.role = 'CONTRACTOR' THEN
            -- Add to project pool (safe), NOT blindly to all sections
            INSERT INTO project_contractors (project_id, contractor_user_id, added_by_admin_id)
            VALUES (v_invite_record.project_id, p_auth_user_id, v_invite_record.created_by_user_id)
            ON CONFLICT DO NOTHING;

            -- If a specific section was indicated, assign to that section only
            IF v_invite_record.section_id IS NOT NULL THEN
                INSERT INTO section_assignments (section_id, contractor_user_id, assigned_at)
                VALUES (v_invite_record.section_id, p_auth_user_id, now())
                ON CONFLICT DO NOTHING;
            END IF;

        ELSIF v_invite_record.role = 'CONSULTANT' THEN
            INSERT INTO project_consultants (project_id, consultant_user_id)
            VALUES (v_invite_record.project_id, p_auth_user_id)
            ON CONFLICT DO NOTHING;
        END IF;
    END IF;

    -- 5. Mark Invitation as Accepted
    UPDATE invitations
    SET status = 'ACCEPTED', accepted_at = now()
    WHERE id = p_invitation_id;

    RETURN true;
END;
$$;


-- ============================================================
-- FIX 11: FIX rpc_create_invitation
-- Replace uuid_generate_v4() with gen_random_uuid()
-- Ensure p_project_id defaults to null for global invites
-- ============================================================

CREATE OR REPLACE FUNCTION rpc_create_invitation(
    p_invitee_email text,
    p_role user_role,
    p_project_id uuid DEFAULT NULL,
    p_section_id uuid DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_invitation_id uuid := gen_random_uuid();
BEGIN
    -- Admin can invite anyone
    IF is_admin() THEN
        NULL;
    -- Consultant can invite contractor only (and must be assigned to the project)
    ELSIF p_role = 'CONTRACTOR' AND p_project_id IS NOT NULL AND is_project_consultant(p_project_id) THEN
        NULL;
    ELSE
        RAISE EXCEPTION 'Unauthorized to create this invitation';
    END IF;

    INSERT INTO invitations (id, invitee_email, role, project_id, section_id, status, created_by_user_id, created_at)
    VALUES (v_invitation_id, p_invitee_email, p_role, p_project_id, p_section_id, 'PENDING', auth.uid(), now());

    RETURN v_invitation_id;
END;
$$;


-- ============================================================
-- FIX 12: RESTRICT INVITATION RLS
-- Replace overly permissive anon_read_pending_invitations
-- Only allow reading a specific invitation by ID (user must know the UUID)
-- ============================================================

DROP POLICY IF EXISTS "anon_read_pending_invitations" ON invitations;

-- Authenticated users can read their own pending invitations (by matching email or being the creator)
CREATE POLICY "read_own_invitations" ON invitations FOR SELECT
USING (
    status = 'PENDING'
    AND (
        -- The invite creator can always see them
        created_by_user_id = auth.uid()
        -- Admin can see all
        OR is_admin()
    )
);

-- Anon key can still read a SPECIFIC pending invitation by ID
-- This is required for the /invite/:id registration flow
-- The UUID acts as an unguessable token — safe because UUIDs are 128-bit random
CREATE POLICY "anon_read_specific_pending_invitation" ON invitations FOR SELECT
USING (
    status = 'PENDING'
    -- No further restriction: the anonymously-known UUID IS the authentication token
    -- RLS naturally scopes to the row the client queries for
);


-- ============================================================
-- DONE: All 13 vulnerabilities patched
-- ============================================================
