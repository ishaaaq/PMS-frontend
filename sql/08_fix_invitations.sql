-- ============================================================
-- SQL MIGRATION: 08_fix_invitations.sql
-- ============================================================

-- ============================================================
-- 5. AUDIT LOGGING ENUM UPDATE (Part 2/2)
-- ============================================================
alter type audit_action add value if not exists 'INVITATION_CREATED';
alter type audit_action add value if not exists 'INVITATION_ACCEPTED';

-- ============================================================
-- 3. FIX INVITATION ACCEPTANCE PIPELINE
-- ============================================================

-- First, drop the original function signatures to allow recreation with defaults
drop function if exists rpc_create_invitation(text, user_role, uuid, uuid);
drop function if exists rpc_create_invitation(text, user_role, uuid);

-- Recreate rpc_create_invitation to include audit logging
create or replace function rpc_create_invitation(
    p_invitee_email text,
    p_role user_role,
    p_project_id uuid,
    p_section_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
    v_invitation_id uuid := uuid_generate_v4();
begin
    -- Admin can invite anyone
    if is_admin() then
        null;
    -- Consultant can invite contractor only
    elsif p_role = 'CONTRACTOR' and is_project_consultant(p_project_id) then
        null;
    else
        raise exception 'Unauthorized';
    end if;

    insert into invitations (
        id,
        invitee_email,
        role,
        project_id,
        section_id,
        status,
        created_by_user_id,
        created_at
    )
    values (
        v_invitation_id,
        p_invitee_email,
        p_role,
        p_project_id,
        p_section_id,
        'PENDING',
        auth.uid(),
        now()
    );

    insert into audit_logs (
        action,
        actor_user_id,
        project_id,
        section_id,
        metadata
    )
    values (
        'INVITATION_CREATED',
        auth.uid(),
        p_project_id,
        p_section_id,
        jsonb_build_object(
            'invitation_id', v_invitation_id,
            'invitee_email', p_invitee_email,
            'role', p_role
        )
    );

    return v_invitation_id;
end;
$$;


-- Now, recreate rpc_accept_invitation to handle project/section assignment
create or replace function rpc_accept_invitation(
    p_invitation_id uuid,
    p_full_name text,
    p_phone text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
    v_user_id uuid := auth.uid();
    v_role user_role;
    v_project_id uuid;
    v_section_id uuid;
begin
    select role, project_id, section_id 
    into v_role, v_project_id, v_section_id
    from invitations
    where id = p_invitation_id
    and status = 'PENDING';

    if v_role is null then
        raise exception 'Invalid or expired invitation';
    end if;

    -- Create user profile
    insert into profiles (
        user_id,
        role,
        full_name,
        phone
    )
    values (
        v_user_id,
        v_role,
        p_full_name,
        p_phone
    )
    on conflict (user_id) do update
    set full_name = excluded.full_name,
        phone = excluded.phone;

    -- Mark invitation as accepted
    update invitations
    set status = 'ACCEPTED'
    where id = p_invitation_id;

    -- Handle Project Auto-Assignment
    if v_project_id is not null then
        if v_role = 'CONSULTANT' then
            insert into project_consultants(project_id, consultant_user_id)
            values (v_project_id, v_user_id)
            on conflict do nothing;
        elsif v_role = 'CONTRACTOR' then
            -- Note: We assume the user accepting has authority over themselves, 
            -- added_by_admin_id can be null or the original inviter. 
            -- For simplicity, we just leave added_by_admin_id null 
            -- or note it in the audit log.
            insert into project_contractors (project_id, contractor_user_id)
            values (v_project_id, v_user_id)
            on conflict do nothing;

            -- Handle Section Auto-Assignment if provided
            if v_section_id is not null then
                insert into section_assignments(section_id, contractor_user_id)
                values (v_section_id, v_user_id)
                on conflict do nothing;
            end if;
        end if;
    end if;

    -- Audit Log
    insert into audit_logs (
        action,
        actor_user_id,
        project_id,
        section_id,
        metadata
    )
    values (
        'INVITATION_ACCEPTED',
        v_user_id,
        v_project_id,
        v_section_id,
        jsonb_build_object(
            'invitation_id', p_invitation_id
        )
    );

    return v_user_id;
end;
$$;
