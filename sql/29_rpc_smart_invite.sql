-- ============================================================
-- 29_rpc_smart_invite.sql
-- Intelligent Invite Assignment Function
-- ============================================================
-- Checks if an email already belongs to a registered user.
-- If so, instantly assigns them to the project without sending an invite link.
-- If not, creates a standard invitation.

CREATE OR REPLACE FUNCTION rpc_smart_invite(
    p_email text,
    p_role user_role,
    p_project_id uuid DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_existing_user_id uuid;
    v_invite_id uuid;
BEGIN
    -- Auth check
    IF NOT is_admin() THEN
        RAISE EXCEPTION 'Unauthorized: Only admins can send invitations';
    END IF;

    -- 1. Check if the user already exists in auth.users
    SELECT id INTO v_existing_user_id
    FROM auth.users
    WHERE email = p_email;

    -- 2. If user exists, assign them immediately
    IF v_existing_user_id IS NOT NULL THEN
        -- We no longer block cross-role assignments. The user's global profile role
        -- remains whatever they registered as, but we add them to the requested project
        -- under newly requested p_role context.

        IF p_project_id IS NOT NULL THEN
            IF p_role = 'CONSULTANT' THEN
                -- Add to project_consultants
                PERFORM rpc_assign_consultant_to_project(p_project_id, v_existing_user_id);
            ELSIF p_role = 'CONTRACTOR' THEN
                -- Add to project_contractors
                PERFORM rpc_add_contractor_to_project(p_project_id, v_existing_user_id);
            END IF;
        END IF;

        RETURN json_build_object(
            'is_new', false,
            'user_id', v_existing_user_id,
            'message', 'Existing user successfully assigned to the project.'
        );
    END IF;

    -- 3. If user does NOT exist, create a normal invitation
    -- Check for an existing pending invitation first
    SELECT id INTO v_invite_id 
    FROM invitations 
    WHERE invitee_email = p_email AND project_id = p_project_id AND status = 'PENDING'
    LIMIT 1;

    IF v_invite_id IS NULL THEN
        -- Create a new one
        INSERT INTO invitations (invitee_email, role, project_id, status, created_by_user_id)
        VALUES (p_email, p_role, p_project_id, 'PENDING', auth.uid())
        RETURNING id INTO v_invite_id;
    END IF;

    RETURN json_build_object(
        'is_new', true,
        'invite_id', v_invite_id,
        'message', 'Invitation link generated for a new user.'
    );
END;
$$;
