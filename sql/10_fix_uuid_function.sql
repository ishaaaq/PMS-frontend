-- Fix the invitation RPC by using the built-in Postgres gen_random_uuid()
-- instead of requiring the uuid-ossp extension.

create or replace function rpc_create_invitation(
    p_invitee_email text,
    p_role user_role,
    p_project_id uuid default null,
    p_section_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
    v_invitation_id uuid := gen_random_uuid();
begin
    -- Admin can invite anyone
    if is_admin() then
        null;
    -- Consultant can invite contractor only
    elsif p_role = 'CONTRACTOR' and p_project_id is not null and is_project_consultant(p_project_id) then
        null;
    else
        raise exception 'Unauthorized to create this invitation';
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

    return v_invitation_id;
end;
$$;
