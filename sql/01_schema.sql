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

