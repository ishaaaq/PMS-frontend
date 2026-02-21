-- ============================================
-- PMS Database Setup - Run in Supabase SQL Editor
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- ===== sql\01_schema.sql =====
-- ============================================================
-- PROJECT MANAGEMENT AND OPERATIONS SYSTEM (MVP)
-- STAGE 3 – SCHEMA
-- ============================================================

-- ============================================================
-- EXTENSIONS
-- ============================================================

create extension if not exists "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================

create type user_role as enum ('ADMIN', 'CONSULTANT', 'CONTRACTOR');

create type project_status as enum ('DRAFT', 'ACTIVE', 'COMPLETED');

create type milestone_status as enum ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED');

create type submission_status as enum ('PENDING_APPROVAL', 'QUERIED', 'APPROVED');

-- ============================================================
-- PROFILES (linked to auth.users)
-- ============================================================

create table profiles (
    user_id uuid primary key references auth.users(id) on delete cascade,
    role user_role not null,
    full_name text not null,
    phone text,
    is_active boolean not null default true,
    created_at timestamptz not null default now()
);

-- ============================================================
-- PROJECTS
-- ============================================================

create table projects (
    id uuid primary key default uuid_generate_v4(),
    title text not null,
    description text,
    location text,
    total_budget numeric(18,2) not null check (total_budget >= 0),
    currency text default 'NGN',
    status project_status not null default 'DRAFT',
    created_by_admin_id uuid not null references profiles(user_id),
    created_at timestamptz not null default now()
);

-- ============================================================
-- PROJECT ↔ CONSULTANT MAPPING
-- ============================================================

create table project_consultants (
    project_id uuid not null references projects(id) on delete cascade,
    consultant_user_id uuid not null references profiles(user_id) on delete cascade,
    assigned_at timestamptz not null default now(),
    primary key (project_id, consultant_user_id)
);

-- ============================================================
-- MILESTONES (defined by ADMIN only)
-- ============================================================

create table milestones (
    id uuid primary key default uuid_generate_v4(),
    project_id uuid not null references projects(id) on delete cascade,
    title text not null,
    description text,
    sort_order integer not null,
    due_date date not null,
    budget numeric(18,2) not null check (budget >= 0),
    status milestone_status not null default 'NOT_STARTED',
    created_at timestamptz not null default now()
);

create index idx_milestones_project on milestones(project_id);

-- ============================================================
-- SECTIONS (created by CONSULTANT)
-- ============================================================

create table sections (
    id uuid primary key default uuid_generate_v4(),
    project_id uuid not null references projects(id) on delete cascade,
    name text not null,
    description text,
    created_by_consultant_id uuid not null references profiles(user_id),
    created_at timestamptz not null default now()
);

create index idx_sections_project on sections(project_id);

-- ============================================================
-- SECTION ↔ MILESTONE MAPPING (1:1 per milestone)
-- ============================================================

create table section_milestones (
    section_id uuid not null references sections(id) on delete cascade,
    milestone_id uuid not null references milestones(id) on delete cascade,
    primary key (section_id, milestone_id),
    unique (milestone_id) -- ensures milestone belongs to only ONE section
);

-- ============================================================
-- SECTION ↔ CONTRACTOR ASSIGNMENTS
-- ============================================================

create table section_assignments (
    section_id uuid not null references sections(id) on delete cascade,
    contractor_user_id uuid not null references profiles(user_id) on delete cascade,
    assigned_at timestamptz not null default now(),
    primary key (section_id, contractor_user_id)
);

-- ============================================================
-- SUBMISSIONS (append-only)
-- ============================================================

create table submissions (
    id uuid primary key default uuid_generate_v4(),
    milestone_id uuid not null references milestones(id) on delete cascade,
    contractor_user_id uuid not null references profiles(user_id),
    work_description text not null,
    status submission_status not null default 'PENDING_APPROVAL',
    query_note text,
    reviewed_by_consultant_id uuid references profiles(user_id),
    submitted_at timestamptz not null default now(),
    reviewed_at timestamptz
);

create index idx_submissions_milestone on submissions(milestone_id);

-- ============================================================
-- SUBMISSION EVIDENCE
-- ============================================================

create table submission_evidence (
    id uuid primary key default uuid_generate_v4(),
    submission_id uuid not null references submissions(id) on delete cascade,
    file_path text not null,
    file_type text,
    file_size bigint,
    uploaded_at timestamptz not null default now()
);

-- ============================================================
-- MATERIAL USAGE LOG
-- ============================================================

create table submission_materials (
    id uuid primary key default uuid_generate_v4(),
    submission_id uuid not null references submissions(id) on delete cascade,
    material_name text not null,
    quantity numeric(18,2) not null check (quantity >= 0),
    unit text not null
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================

create table notifications (
    id uuid primary key default uuid_generate_v4(),
    section_id uuid not null references sections(id) on delete cascade,
    title text not null,
    message text not null,
    created_by_user_id uuid not null references profiles(user_id),
    created_at timestamptz not null default now()
);

create table notification_deliveries (
    notification_id uuid not null references notifications(id) on delete cascade,
    contractor_user_id uuid not null references profiles(user_id) on delete cascade,
    is_read boolean not null default false,
    read_at timestamptz,
    primary key (notification_id, contractor_user_id)
);

-- ============================================================
-- PROJECT COMMENTS (ADMIN + CONSULTANT ONLY)
-- ============================================================

create table project_comments (
    id uuid primary key default uuid_generate_v4(),
    project_id uuid not null references projects(id) on delete cascade,
    author_user_id uuid not null references profiles(user_id),
    body text not null,
    created_at timestamptz not null default now()
);

-- ============================================================
-- INVITATIONS (TOKEN-BASED)
-- ============================================================

-- create type invitation_status as enum (
--     'PENDING',
--     'ACCEPTED',
--     'EXPIRED',
--     'REVOKED'
-- );

-- create table invitations (
--     id uuid primary key default uuid_generate_v4(),

--     invitee_email text not null,
--     role user_role not null,

--     project_id uuid references projects(id) on delete cascade,
--     section_id uuid references sections(id) on delete cascade,

--     token_hash text not null unique,
--     expires_at timestamptz not null,

--     status invitation_status not null default 'PENDING',

--     created_by_user_id uuid not null references profiles(user_id),
--     created_at timestamptz not null default now(),
--     accepted_at timestamptz
-- );

-- create index idx_invitations_email on invitations(invitee_email);
-- create index idx_invitations_token on invitations(token_hash);

create type invitation_status as enum ('PENDING', 'ACCEPTED', 'EXPIRED', 'REVOKED');

create table invitations (
    id uuid primary key default uuid_generate_v4(),
    invitee_email text not null,
    role user_role not null, -- CONSULTANT or CONTRACTOR in practice
    project_id uuid references projects(id) on delete cascade,
    section_id uuid references sections(id) on delete set null,
    token_hash text,          -- optional if you accept by invitation_id for now
    status invitation_status not null default 'PENDING',
    created_by_user_id uuid not null references profiles(user_id),
    expires_at timestamptz,
    created_at timestamptz not null default now()
);

create index idx_invitations_project on invitations(project_id);
create index idx_invitations_email on invitations(invitee_email);



-- ===== sql\02_rls.sql =====
-- ============================================================
-- PROJECT MANAGEMENT AND OPERATIONS SYSTEM (MVP)
-- STAGE 3 – RLS
-- ============================================================

-- ============================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================

alter table profiles enable row level security;
alter table projects enable row level security;
alter table project_consultants enable row level security;
alter table milestones enable row level security;
alter table sections enable row level security;
alter table section_milestones enable row level security;
alter table section_assignments enable row level security;
alter table submissions enable row level security;
alter table submission_evidence enable row level security;
alter table submission_materials enable row level security;
alter table notifications enable row level security;
alter table notification_deliveries enable row level security;
alter table project_comments enable row level security;

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

create or replace function is_admin()
returns boolean
language sql stable
security definer
set search_path = public
as $$
    select exists (
        select 1 from profiles
        where user_id = auth.uid()
        and role = 'ADMIN'
        and is_active = true
    );
$$;

create or replace function is_project_consultant(p_project_id uuid)
returns boolean
language sql stable
security definer
set search_path = public
as $$
    select exists (
        select 1
        from project_consultants pc
        where pc.project_id = p_project_id
        and pc.consultant_user_id = auth.uid()
    );
$$;

create or replace function is_section_contractor(p_section_id uuid)
returns boolean
language sql stable
security definer
set search_path = public
as $$
    select exists (
        select 1
        from section_assignments sa
        where sa.section_id = p_section_id
        and sa.contractor_user_id = auth.uid()
    );
$$;

create or replace function milestone_belongs_to_section_for_contractor(p_milestone_id uuid)
returns boolean
language sql stable
as $$
    select exists (
        select 1
        from section_milestones sm
        join section_assignments sa on sa.section_id = sm.section_id
        where sm.milestone_id = p_milestone_id
        and sa.contractor_user_id = auth.uid()
    );
$$;

create or replace function milestone_project_id(p_milestone_id uuid)
returns uuid
language sql stable
as $$
    select project_id from milestones where id = p_milestone_id;
$$;

create or replace function section_project_id(p_section_id uuid)
returns uuid
language sql stable
as $$
  select project_id from sections where id = p_section_id;
$$;

create or replace function can_read_submission(p_submission_id uuid)
returns boolean
language sql stable
as $$
  select
    is_admin()
    OR exists (
      select 1
      from submissions s
      where s.id = p_submission_id
      and (
        contractor_user_id = auth.uid()
        OR is_project_consultant(milestone_project_id(s.milestone_id))
      )
    );
$$;

create or replace function extract_submission_id_from_path(p_path text)
returns uuid
language sql
stable
as $$
  select split_part(p_path, '/', 6)::uuid;
$$;

create or replace function is_submission_owner(p_submission_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from submissions
    where id = p_submission_id
    and contractor_user_id = auth.uid()
  );
$$;

-- ============================================================
-- SECTION MILESTONES & ASSIGNMENTS (Missing Policies)
-- ============================================================

create policy "admin_section_milestones"
on section_milestones for select
using (is_admin());

create policy "consultant_section_milestones"
on section_milestones for select
using (
  exists (
    select 1 from sections s
    where s.id = section_milestones.section_id
    and is_project_consultant(s.project_id)
  )
);

create policy "contractor_section_milestones"
on section_milestones for select
using (
  exists (
    select 1 from section_assignments sa
    where sa.section_id = section_milestones.section_id
    and sa.contractor_user_id = auth.uid()
  )
);

create policy "section_milestones_block_writes"
on section_milestones for all
using (false)
with check (false);


create policy "admin_section_assignments"
on section_assignments for select
using (is_admin());

create policy "consultant_section_assignments"
on section_assignments for select
using (
  exists (
    select 1 from sections s
    where s.id = section_assignments.section_id
    and is_project_consultant(s.project_id)
  )
);

create policy "contractor_section_assignments_self"
on section_assignments for select
using (contractor_user_id = auth.uid());

create policy "section_assignments_block_writes"
on section_assignments for all
using (false)
with check (false);


-- ============================================================
-- PROFILES
-- ============================================================

create policy "profiles_self_read"
on profiles for select
using (user_id = auth.uid() OR is_admin());

-- No direct insert/update/delete allowed
create policy "profiles_block_writes"
on profiles for all
using (false)
with check (false);

-- ============================================================
-- PROJECTS
-- ============================================================

create policy "admin_full_projects"
on projects for select
using (is_admin());

create policy "consultant_projects"
on projects for select
using (is_project_consultant(id));

-- Contractors cannot read projects directly
-- No direct writes allowed (RPC only)
create policy "projects_block_writes"
on projects for all
using (false)
with check (false);

create policy "contractor_view_assigned_projects"
on projects for select
using (
    exists (
        select 1 
        from section_assignments sa
        join sections s on s.id = sa.section_id
        where s.project_id = projects.id
        and sa.contractor_user_id = auth.uid()
    )
);

-- ============================================================
-- PROJECT ↔ CONSULTANT MAPPING
-- ============================================================

create policy "admin_project_consultants"
on project_consultants for select
using (is_admin());

create policy "consultant_view_own"
on project_consultants for select
using (consultant_user_id = auth.uid());

create policy "project_consultants_block_writes"
on project_consultants for all
using (false)
with check (false);

-- ============================================================
-- MILESTONES
-- ============================================================

create policy "admin_milestones"
on milestones for select
using (is_admin());

create policy "consultant_milestones"
on milestones for select
using (is_project_consultant(project_id));

create policy "contractor_milestones"
on milestones for select
using (milestone_belongs_to_section_for_contractor(id));

create policy "milestones_block_writes"
on milestones for all
using (false)
with check (false);

-- ============================================================
-- SECTIONS
-- ============================================================

create policy "admin_sections"
on sections for select
using (is_admin());

create policy "consultant_sections"
on sections for select
using (is_project_consultant(project_id));

create policy "contractor_sections"
on sections for select
using (is_section_contractor(id));

create policy "sections_block_writes"
on sections for all
using (false)
with check (false);

-- ============================================================
-- SUBMISSIONS
-- ============================================================

create policy "admin_submissions"
on submissions for select
using (is_admin());

create policy "consultant_submissions"
on submissions for select
using (
    is_project_consultant(
        milestone_project_id(milestone_id)
    )
);

create policy "contractor_submissions"
on submissions for select
using (
    contractor_user_id = auth.uid()
);

create policy "submissions_block_writes"
on submissions for all
using (false)
with check (false);

-- ============================================================
-- SUBMISSION EVIDENCE
-- ============================================================

create policy "evidence_visible_if_submission_visible"
on submission_evidence for select
using (
    exists (
        select 1 from submissions s
        where s.id = submission_id
    )
);

create policy "evidence_block_writes"
on submission_evidence for all
using (false)
with check (false);

-- ============================================================
-- MATERIALS
-- ============================================================

create policy "materials_visible_if_submission_visible"
on submission_materials for select
using (
    exists (
        select 1 from submissions s
        where s.id = submission_id
    )
);

create policy "materials_block_writes"
on submission_materials for all
using (false)
with check (false);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================

-- notifications SELECT
create policy "admin_notifications"
on notifications for select
using (is_admin());

create policy "consultant_notifications"
on notifications for select
using (is_project_consultant(section_project_id(section_id)));

create policy "notifications_block_writes"
on notifications for all
using (false)
with check (false);

-- notification_deliveries SELECT / UPDATE(read)
create policy "admin_notification_deliveries"
on notification_deliveries for select
using (is_admin());

create policy "consultant_notification_deliveries"
on notification_deliveries for select
using (
  is_project_consultant(
    section_project_id((select section_id from notifications n where n.id = notification_id))
  )
);

create policy "contractor_notification_deliveries"
on notification_deliveries for select
using (contractor_user_id = auth.uid());

create policy "contractor_mark_read"
on notification_deliveries for update
using (contractor_user_id = auth.uid())
with check (contractor_user_id = auth.uid());


-- ============================================================
-- PROJECT COMMENTS
-- ============================================================

create policy "admin_comments"
on project_comments for select
using (is_admin());

create policy "consultant_comments"
on project_comments for select
using (is_project_consultant(project_id));

create policy "comments_block_writes"
on project_comments for all
using (false)
with check (false);


drop policy if exists "evidence_visible_if_submission_visible" on submission_evidence;
create policy "evidence_select"
on submission_evidence for select
using (can_read_submission(submission_id));

drop policy if exists "materials_visible_if_submission_visible" on submission_materials;
create policy "materials_select"
on submission_materials for select
using (can_read_submission(submission_id));


-- ===== sql\03_rpc.sql =====
-- ============================================================
-- PROJECT MANAGEMENT AND OPERATIONS SYSTEM (MVP)
-- STAGE 3 – RPC IMPLEMENTATION
-- CONSOLIDATED FILE
-- ============================================================

-- IMPORTANT:
-- Ensure owner of these functions is a privileged role.
-- These rely on helper functions from RLS file.
-- SECURITY DEFINER is required.
-- ============================================================


-- ============================================================
-- RPC-03: CREATE PROJECT (WITH MILESTONES + BUDGET VALIDATION)
-- ============================================================

create or replace function rpc_create_project(payload jsonb)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
    v_project_id uuid;
    v_total_budget numeric;
    v_sum_budget numeric := 0;
    v_m jsonb;
begin
    if not is_admin() then
        raise exception 'Unauthorized';
    end if;

    v_total_budget := (payload->>'total_budget')::numeric;

    if v_total_budget < 0 then
        raise exception 'Project total budget must be non-negative';
    end if;

    insert into audit_logs (
    action,
    actor_user_id,
    project_id,
    metadata
)
values (
    'PROJECT_CREATED',
    auth.uid(),
    v_project_id,
    jsonb_build_object(
        'title', payload->>'title',
        'total_budget', v_total_budget
    )
);

    insert into projects (
        title,
        description,
        location,
        total_budget,
        currency,
        created_by_admin_id,
        status
    )
    values (
        payload->>'title',
        payload->>'description',
        payload->>'location',
        v_total_budget,
        coalesce(payload->>'currency','NGN'),
        auth.uid(),
        'ACTIVE'
    )
    returning id into v_project_id;

    for v_m in select * from jsonb_array_elements(payload->'milestones')
    loop
        if (v_m->>'budget')::numeric < 0 then
            raise exception 'Milestone budget must be non-negative';
        end if;

        v_sum_budget := v_sum_budget + (v_m->>'budget')::numeric;

        insert into milestones (
            project_id,
            title,
            description,
            sort_order,
            due_date,
            budget
        )
        values (
            v_project_id,
            v_m->>'title',
            v_m->>'description',
            (v_m->>'sort_order')::int,
            (v_m->>'due_date')::date,
            (v_m->>'budget')::numeric
        );
    end loop;

    if v_sum_budget > v_total_budget then
        raise exception 'Sum of milestone budgets exceeds project total budget';
    end if;

    return v_project_id;
end;
$$;


-- ============================================================
-- RPC-05: CREATE SECTION
-- ============================================================

create or replace function rpc_create_section(
    p_project_id uuid,
    p_name text,
    p_description text,
    p_milestone_ids uuid[]
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
    v_section_id uuid;
    v_mid uuid;
    v_project_check uuid;
begin
    if not is_project_consultant(p_project_id) then
        raise exception 'Unauthorized';
    end if;

    insert into sections (
        project_id,
        name,
        description,
        created_by_consultant_id
    )
    values (
        p_project_id,
        p_name,
        p_description,
        auth.uid()
    )
    returning id into v_section_id;

    foreach v_mid in array p_milestone_ids
    loop
        select project_id into v_project_check
        from milestones
        where id = v_mid;

        if v_project_check != p_project_id then
            raise exception 'Milestone does not belong to project';
        end if;

        insert into section_milestones(section_id, milestone_id)
        values (v_section_id, v_mid);
    end loop;

    return v_section_id;

    insert into audit_logs (
    action,
    actor_user_id,
    project_id,
    section_id,
    metadata
)
values (
    'SECTION_CREATED',
    auth.uid(),
    p_project_id,
    v_section_id,
    jsonb_build_object('name', p_name)
);

end;
$$;


-- ============================================================
-- RPC-07: ASSIGN CONTRACTOR TO SECTION
-- ============================================================

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
    select project_id into v_project_id
    from sections
    where id = p_section_id;

    if not is_project_consultant(v_project_id) then
        raise exception 'Unauthorized';
    end if;

    insert into section_assignments(section_id, contractor_user_id)
    values (p_section_id, p_contractor_user_id)
    on conflict do nothing;

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


-- ============================================================
-- RPC-08: CREATE SUBMISSION (APPEND ONLY)
-- ============================================================

create or replace function rpc_create_submission(
    p_milestone_id uuid,
    p_work_description text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
    v_submission_id uuid;
begin
    if not milestone_belongs_to_section_for_contractor(p_milestone_id) then
        raise exception 'Unauthorized';
    end if;

    insert into submissions (
        milestone_id,
        contractor_user_id,
        work_description,
        status
    )
    values (
        p_milestone_id,
        auth.uid(),
        p_work_description,
        'PENDING_APPROVAL'
    )
    returning id into v_submission_id;

    update milestones
    set status = 'IN_PROGRESS'
    where id = p_milestone_id
    and status = 'NOT_STARTED';

    return v_submission_id;

    insert into audit_logs (
    action,
    actor_user_id,
    project_id,
    milestone_id,
    submission_id
)
values (
    'SUBMISSION_CREATED',
    auth.uid(),
    milestone_project_id(p_milestone_id),
    p_milestone_id,
    v_submission_id
);

end;
$$;


-- ============================================================
-- RPC-09: QUERY SUBMISSION
-- ============================================================

create or replace function rpc_query_submission(
    p_submission_id uuid,
    p_query_note text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
    v_project_id uuid;
begin
    select milestone_project_id(s.milestone_id)
    into v_project_id
    from submissions s
    where s.id = p_submission_id;

    if not is_project_consultant(v_project_id) then
        raise exception 'Unauthorized';
    end if;

    update submissions
    set status = 'QUERIED',
        query_note = p_query_note,
        reviewed_by_consultant_id = auth.uid(),
        reviewed_at = now()
    where id = p_submission_id;

    insert into audit_logs (
    action,
    actor_user_id,
    project_id,
    submission_id,
    metadata
)
values (
    'SUBMISSION_QUERIED',
    auth.uid(),
    v_project_id,
    p_submission_id,
    jsonb_build_object('note', p_query_note)
);

end;
$$;


-- ============================================================
-- RPC-10: APPROVE SUBMISSION
-- ============================================================

create or replace function rpc_approve_submission(
    p_submission_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
    v_milestone_id uuid;
    v_project_id uuid;
begin
    select milestone_id into v_milestone_id
    from submissions
    where id = p_submission_id;

    v_project_id := milestone_project_id(v_milestone_id);

    if not is_project_consultant(v_project_id) then
        raise exception 'Unauthorized';
    end if;

    update submissions
    set status = 'APPROVED',
        reviewed_by_consultant_id = auth.uid(),
        reviewed_at = now()
    where id = p_submission_id;

    update milestones
    set status = 'COMPLETED'
    where id = v_milestone_id;

    insert into audit_logs (
    action,
    actor_user_id,
    project_id,
    submission_id
)
values (
    'SUBMISSION_APPROVED',
    auth.uid(),
    v_project_id,
    p_submission_id
);

end;
$$;

-- ============================================================
-- RPC-01: CREATE INVITATION
-- ============================================================

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

    return v_invitation_id;
end;
$$;


-- ============================================================
-- RPC-02: ACCEPT INVITATION
-- ============================================================

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
begin
    select role into v_role
    from invitations
    where id = p_invitation_id
    and status = 'PENDING';

    if v_role is null then
        raise exception 'Invalid or expired invitation';
    end if;

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
    );

    update invitations
    set status = 'ACCEPTED'
    where id = p_invitation_id;

    return v_user_id;
end;
$$;


-- ============================================================
-- RPC-04: ASSIGN CONSULTANT TO PROJECT
-- ============================================================

create or replace function rpc_assign_consultant_to_project(
    p_project_id uuid,
    p_consultant_user_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
    if not is_admin() then
        raise exception 'Unauthorized';
    end if;

    insert into project_consultants(project_id, consultant_user_id)
    values (p_project_id, p_consultant_user_id)
    on conflict do nothing;

    insert into audit_logs (
    action,
    actor_user_id,
    project_id,
    metadata
)
values (
    'CONSULTANT_ASSIGNED',
    auth.uid(),
    p_project_id,
    jsonb_build_object(
        'consultant_user_id', p_consultant_user_id
    )
);

end;
$$;



-- ============================================================
-- RPC-11: SEND SECTION NOTIFICATION
-- ============================================================

create or replace function rpc_send_section_notification(
    p_section_id uuid,
    p_title text,
    p_message text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
    v_notification_id uuid := uuid_generate_v4();
    v_project_id uuid;
begin
    select project_id into v_project_id
    from sections
    where id = p_section_id;

    if not is_project_consultant(v_project_id) then
        raise exception 'Unauthorized';
    end if;

    insert into notifications (
        id,
        section_id,
        title,
        message,
        created_by_user_id
    )
    values (
        v_notification_id,
        p_section_id,
        p_title,
        p_message,
        auth.uid()
    );

    insert into notification_deliveries (
        notification_id,
        contractor_user_id
    )
    select v_notification_id, contractor_user_id
    from section_assignments
    where section_id = p_section_id;

    return v_notification_id;

    insert into audit_logs (
    action,
    actor_user_id,
    project_id,
    section_id
)
values (
    'NOTIFICATION_SENT',
    auth.uid(),
    v_project_id,
    p_section_id
);

end;
$$;


-- ============================================================
-- RPC-12: ADD PROJECT COMMENT
-- ============================================================

create or replace function rpc_add_project_comment(
    p_project_id uuid,
    p_body text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
    v_comment_id uuid := uuid_generate_v4();
begin
    if not (is_admin() or is_project_consultant(p_project_id)) then
        raise exception 'Unauthorized';
    end if;

    insert into project_comments (
        id,
        project_id,
        author_user_id,
        body
    )
    values (
        v_comment_id,
        p_project_id,
        auth.uid(),
        p_body
    );

    return v_comment_id;

    insert into audit_logs (
    action,
    actor_user_id,
    project_id
)
values (
    'PROJECT_COMMENT_ADDED',
    auth.uid(),
    p_project_id
);

end;
$$;

-- ============================================================
-- audit_logs RLS policies
-- ============================================================
alter table audit_logs enable row level security;

create policy "admin_read_audit"
on audit_logs for select
using (is_admin());

create policy "consultant_read_project_audit"
on audit_logs for select
using (
    project_id is not null
    and is_project_consultant(project_id)
);

create policy "audit_block_writes"
on audit_logs for all
using (false)
with check (false);


-- ===== sql\04_audit.sql =====
create type audit_action as enum (
  'PROJECT_CREATED',
  'CONSULTANT_ASSIGNED',
  'SECTION_CREATED',
  'SECTION_UPDATED',
  'CONTRACTOR_ASSIGNED',
  'SUBMISSION_CREATED',
  'SUBMISSION_QUERIED',
  'SUBMISSION_APPROVED',
  'NOTIFICATION_SENT',
  'PROJECT_COMMENT_ADDED'
);

create table audit_logs (
    id uuid primary key default uuid_generate_v4(),

    action audit_action not null,

    actor_user_id uuid not null references profiles(user_id),

    project_id uuid references projects(id) on delete set null,
    section_id uuid references sections(id) on delete set null,
    milestone_id uuid references milestones(id) on delete set null,
    submission_id uuid references submissions(id) on delete set null,

    metadata jsonb,

    created_at timestamptz not null default now()
);

create index idx_audit_project on audit_logs(project_id);
create index idx_audit_section on audit_logs(section_id);
create index idx_audit_submission on audit_logs(submission_id);
create index idx_audit_actor on audit_logs(actor_user_id);


-- ===== sql\05_project_contractors.sql =====
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


-- ===== sql\06_fix_profiles_rls.sql =====
-- ============================================================
-- SQL MIGRATION: FIX CONSULTANT → CONTRACTOR VISIBILITY
-- Problem: Consultants cannot see contractor profiles due to
--          profiles RLS (self-read + admin only).
--          Adding a profiles RLS policy causes infinite recursion
--          because is_admin() → profiles → project_contractors → is_project_consultant() → project_consultants → is_admin() → ...
-- Solution: Use a SECURITY DEFINER RPC to bypass RLS entirely.
-- ============================================================

-- 1. DROP the recursive policy if it was already applied
drop policy if exists "consultant_view_project_contractors_profiles" on profiles;

-- 2. Create RPC to fetch project contractors with profile details
--    Accessible by consultants assigned to the project
create or replace function rpc_get_project_contractors(p_project_id uuid)
returns table (
    contractor_user_id uuid,
    full_name text,
    phone text,
    added_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
    -- Auth check: must be admin or project consultant
    if not is_admin() and not is_project_consultant(p_project_id) then
        raise exception 'Unauthorized';
    end if;

    return query
        select
            pc.contractor_user_id,
            p.full_name,
            p.phone,
            pc.added_at
        from project_contractors pc
        join profiles p on p.user_id = pc.contractor_user_id
        where pc.project_id = p_project_id;
end;
$$;


