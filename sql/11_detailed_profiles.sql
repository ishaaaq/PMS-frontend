-- ============================================================
-- 11_detailed_profiles.sql
-- Adds extended profile tables and an RPC for Invite Registration
-- ============================================================

-- Create Extended Contractor Profiles
create table if not exists contractor_profiles (
    user_id uuid primary key references profiles(user_id) on delete cascade,
    company_name text not null,
    registration_number text not null,
    zone text not null,
    created_at timestamptz not null default now()
);

-- Create Extended Consultant Profiles
create table if not exists consultant_profiles (
    user_id uuid primary key references profiles(user_id) on delete cascade,
    specialization text not null,
    department text not null,
    region text not null,
    created_at timestamptz not null default now()
);

-- RLS for Contractor Profiles
alter table contractor_profiles enable row level security;
create policy "admin_read_contractor_profiles" on contractor_profiles for select using (is_admin());
create policy "contractor_read_own_profile" on contractor_profiles for select using (user_id = auth.uid());
create policy "block_contractor_writes" on contractor_profiles for all using (false) with check (false);

-- RLS for Consultant Profiles
alter table consultant_profiles enable row level security;
create policy "admin_read_consultant_profiles" on consultant_profiles for select using (is_admin());
create policy "consultant_read_own_profile" on consultant_profiles for select using (user_id = auth.uid());
create policy "block_consultant_writes" on consultant_profiles for all using (false) with check (false);

-- Open read access to PENDING invitations so the frontend can retrieve the email/role before signup
create policy "anon_read_pending_invitations" on invitations for select using (status = 'PENDING');


-- ============================================================
-- REGISTRATION RPC
-- ============================================================
-- Since Supabase handles the actual user auth, the frontend will call supabase.auth.signUp() first.
-- Then, it will immediately call this RPC with the generated user_id to finalize the detailed profiles
-- and mark the invitation as accepted, all in one secure transaction.

create or replace function rpc_accept_invitation_with_details(
    p_invitation_id uuid,
    p_auth_user_id uuid,
    p_full_name text,
    p_phone text,
    -- Contractor Params
    p_company_name text default null,
    p_registration_number text default null,
    p_zone text default null,
    -- Consultant Params
    p_specialization text default null,
    p_department text default null,
    p_region text default null
)
returns boolean
language plpgsql
security definer -- Elevates privileges so we can securely write into profiles tables
set search_path = public
as $$
declare
    v_invite_record record;
begin
    -- 1. Fetch and Lock the Invitation
    select * into v_invite_record
    from invitations
    where id = p_invitation_id and status = 'PENDING'
    for update; 

    if not found then
        raise exception 'Invalid or already accepted invitation.';
    end if;

    -- 2. Create the core profile
    insert into profiles (user_id, role, full_name, phone, is_active)
    values (p_auth_user_id, v_invite_record.role::user_role, p_full_name, p_phone, true);

    -- 3. Branch logic for extended profiles based on the enforced role
    if v_invite_record.role = 'CONTRACTOR' then
        if p_company_name is null or p_registration_number is null or p_zone is null then
            raise exception 'Missing required contractor fields.';
        end if;
        insert into contractor_profiles (user_id, company_name, registration_number, zone)
        values (p_auth_user_id, p_company_name, p_registration_number, p_zone);

    elsif v_invite_record.role = 'CONSULTANT' then
        if p_specialization is null or p_department is null or p_region is null then
            raise exception 'Missing required consultant fields.';
        end if;
        insert into consultant_profiles (user_id, specialization, department, region)
        values (p_auth_user_id, p_specialization, p_department, p_region);
    end if;

    -- 4. Automatically link the user to the Project if the invite had a project_id
    if v_invite_record.project_id is not null then
        if v_invite_record.role = 'CONTRACTOR' then
            -- Assign as internal pool contractor for the project (requires rpc_add_project_contractor logic)
            -- For simplicity in MVP, we might need direct insert if we skip RPC nested boundaries
            insert into section_assignments (section_id, contractor_user_id, assigned_at)
            select id, p_auth_user_id, now()
            from sections 
            where project_id = v_invite_record.project_id
            -- we might just assign them to the specific section if section_id was provided
            and (v_invite_record.section_id is null or id = v_invite_record.section_id);
            
            -- Note: If section_id is null, this blindly assigns them to ALL sections. 
            -- A better MVP approach if section_id is null is to just allow them read access via project mapping
            -- However, looking at the schema, Contractors only get access via `section_assignments`.

        elsif v_invite_record.role = 'CONSULTANT' then
            insert into project_consultants (project_id, consultant_user_id)
            values (v_invite_record.project_id, p_auth_user_id);
        end if;
    end if;

    -- 5. Mark Invitation as Accepted
    update invitations
    set status = 'ACCEPTED', accepted_at = now()
    where id = p_invitation_id;

    return true;
end;
$$;
