-- ============================================================
-- SQL MIGRATION: 10_sso_mfa_bypass.sql
-- ============================================================

-- ============================================================
-- 1. Helper function to check session validity 
-- ============================================================

-- Returns true if the user's session has achieved AAL2 (MFA verified)
-- OR if the user's session was authenticated via a magic link (used by SSO)
CREATE OR REPLACE FUNCTION has_valid_session()
RETURNS boolean
LANGUAGE sql STABLE
AS $$
  SELECT auth.jwt() ->> 'aal' = 'aal2' 
      OR auth.jwt()->'amr' @> '[{"method": "magiclink"}]'::jsonb;
$$;

-- ============================================================
-- 2. Update existing role-check functions
-- ============================================================

CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql STABLE
SECURITY definer
SET search_path = public
AS $$
    SELECT exists (
        SELECT 1 FROM profiles
        WHERE user_id = auth.uid()
        AND role = 'ADMIN'
        AND is_active = true
        AND has_valid_session()
    );
$$;

CREATE OR REPLACE FUNCTION is_project_consultant(p_project_id uuid)
RETURNS boolean
LANGUAGE sql STABLE
SECURITY definer
SET search_path = public
AS $$
    SELECT exists (
        SELECT 1
        FROM project_consultants pc
        WHERE pc.project_id = p_project_id
        AND pc.consultant_user_id = auth.uid()
        AND has_valid_session()
    );
$$;

CREATE OR REPLACE FUNCTION is_section_contractor(p_section_id uuid)
RETURNS boolean
LANGUAGE sql STABLE
SECURITY definer
SET search_path = public
AS $$
    SELECT exists (
        SELECT 1
        FROM section_assignments sa
        WHERE sa.section_id = p_section_id
        AND sa.contractor_user_id = auth.uid()
        AND has_valid_session()
    );
$$;

CREATE OR REPLACE FUNCTION milestone_belongs_to_section_for_contractor(p_milestone_id uuid)
RETURNS boolean
LANGUAGE sql STABLE
AS $$
    SELECT exists (
        SELECT 1
        FROM section_milestones sm
        JOIN section_assignments sa ON sa.section_id = sm.section_id
        WHERE sm.milestone_id = p_milestone_id
        AND sa.contractor_user_id = auth.uid()
        AND has_valid_session()
    );
$$;

CREATE OR REPLACE FUNCTION is_submission_owner(p_submission_id uuid)
RETURNS boolean
LANGUAGE sql STABLE
AS $$
  SELECT exists (
    SELECT 1
    FROM submissions
    WHERE id = p_submission_id
    AND contractor_user_id = auth.uid()
    AND has_valid_session()
  );
$$;

-- ============================================================
-- 3. Update RLS Policies using generic AAL2 checks
-- ============================================================

-- section_assignments
DROP POLICY IF EXISTS "contractor_section_assignments_self" ON section_assignments;
CREATE POLICY "contractor_section_assignments_self"
ON section_assignments FOR SELECT
USING (contractor_user_id = auth.uid() AND has_valid_session());

-- projects
DROP POLICY IF EXISTS "contractor_view_assigned_projects" ON projects;
CREATE POLICY "contractor_view_assigned_projects"
ON projects FOR SELECT
USING (
    EXISTS (
        SELECT 1 
        FROM section_assignments sa
        JOIN sections s ON s.id = sa.section_id
        WHERE s.project_id = projects.id
        AND sa.contractor_user_id = auth.uid()
        AND has_valid_session()
    )
);

-- submissions
DROP POLICY IF EXISTS "contractor_submissions" ON submissions;
CREATE POLICY "contractor_submissions"
ON submissions FOR SELECT
USING (
    contractor_user_id = auth.uid()
    AND has_valid_session()
);

-- section_milestones
DROP POLICY IF EXISTS "contractor_section_milestones" ON section_milestones;
CREATE POLICY "contractor_section_milestones"
ON section_milestones FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM section_assignments sa
    WHERE sa.section_id = section_milestones.section_id
    AND sa.contractor_user_id = auth.uid()
    AND has_valid_session()
  )
);

-- notification_deliveries (Read)
DROP POLICY IF EXISTS "contractor_notification_deliveries" ON notification_deliveries;
CREATE POLICY "contractor_notification_deliveries"
ON notification_deliveries FOR SELECT
USING (contractor_user_id = auth.uid() AND has_valid_session());

-- notification_deliveries (Update)
DROP POLICY IF EXISTS "contractor_mark_read" ON notification_deliveries;
CREATE POLICY "contractor_mark_read"
ON notification_deliveries FOR UPDATE
USING (contractor_user_id = auth.uid() AND has_valid_session())
WITH CHECK (contractor_user_id = auth.uid() AND has_valid_session());

-- profiles
DROP POLICY IF EXISTS "profiles_self_read" ON profiles;
CREATE POLICY "profiles_self_read"
ON profiles FOR SELECT
USING ( (user_id = auth.uid() AND has_valid_session()) OR is_admin() );
