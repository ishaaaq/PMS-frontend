-- ============================================================
-- SQL MIGRATION: PROJECT CONTRACTOR POOL
-- Task: Implement project-level contractor membership
-- ============================================================

-- 1. Create project_contractors table
create table project_contractors (
    project_id uuid references projects(id) on delete cascade,
    contractor_user_id uuid references profiles(user_id) on delete cascade,
    added_by_admin_id uuid references profiles(user_id),
    added_at timestamptz not null default now(),
    primary key (project_id, contractor_user_id)
);

-- 2. Enable RLS
alter table project_contractors enable row level security;

-- 3. RLS Policies

-- Admin SELECT all
create policy "admin_project_contractors_select"
on project_contractors for select
using (is_admin());

-- Consultant SELECT where consultant assigned to the project
create policy "consultant_project_contractors_select"
on project_contractors for select
using (is_project_consultant(project_id));

-- Contractor SELECT self (optional but good for "My Projects" list)
create policy "contractor_project_contractors_select"
on project_contractors for select
using (contractor_user_id = auth.uid());

-- Block writes (only allow via RPC)
create policy "project_contractors_block_writes"
on project_contractors for all
using (false)
with check (false);


-- 4. Update Audit Action Enum
-- Note: 'CONTRACTOR_ADDED_TO_PROJECT'
alter type audit_action add value 'CONTRACTOR_ADDED_TO_PROJECT';


-- 5. RPC: Add Contractor to Project (Admin Only)
create or replace function rpc_add_contractor_to_project(
    p_project_id uuid,
    p_contractor_user_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
    -- Auth check
    if not is_admin() then
        raise exception 'Unauthorized';
    end if;

    -- Insert into project_contractors
    insert into project_contractors (
        project_id,
        contractor_user_id,
        added_by_admin_id
    )
    values (
        p_project_id,
        p_contractor_user_id,
        auth.uid()
    )
    on conflict (project_id, contractor_user_id) do nothing;

    -- Audit Log
    insert into audit_logs (
        action,
        actor_user_id,
        project_id,
        metadata
    )
    values (
        'CONTRACTOR_ADDED_TO_PROJECT',
        auth.uid(),
        p_project_id,
        jsonb_build_object(
            'contractor_user_id', p_contractor_user_id
        )
    );
end;
$$;


-- 6. Update RPC: Assign Contractor to Section
-- Constraint: Contractor MUST be in project_contractors first
create or replace function rpc_assign_contractor_to_section(
    p_section_id uuid,
    p_contractor_user_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
    v_project_id uuid;
begin
    -- Get project_id for auth check and constraint check
    select project_id into v_project_id
    from sections
    where id = p_section_id;

    if v_project_id is null then
        raise exception 'Section not found';
    end if;

    -- Auth Check (Consultant)
    if not is_project_consultant(v_project_id) then
        raise exception 'Unauthorized';
    end if;

    -- NEW: Check if contractor is member of the project
    if not exists (
        select 1 
        from project_contractors 
        where project_id = v_project_id 
        and contractor_user_id = p_contractor_user_id
    ) then
        raise exception 'Contractor must be added to the project pool before assignment to a section';
    end if;

    -- Perform Assignment
    insert into section_assignments(section_id, contractor_user_id)
    values (p_section_id, p_contractor_user_id)
    on conflict do nothing;

    -- Audit Log
    insert into audit_logs (
        action,
        actor_user_id,
        project_id,
        section_id,
        metadata
    )
    values (
        'CONTRACTOR_ASSIGNED',
        auth.uid(),
        v_project_id,
        p_section_id,
        jsonb_build_object(
            'contractor_user_id', p_contractor_user_id
        )
    );

end;
$$;
