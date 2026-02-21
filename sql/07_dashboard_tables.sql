-- ============================================================
-- 07_dashboard_tables.sql
-- New tables for dashboard data that was previously hardcoded
-- Run this in the Supabase SQL Editor
-- ============================================================

-- ============================================================
-- RISK ALERTS
-- ============================================================

DO $$ BEGIN
    CREATE TYPE risk_intensity AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

create table if not exists risk_alerts (
    id uuid primary key default gen_random_uuid(),
    project_id uuid references projects(id) on delete cascade,
    title text not null,
    reason text not null,
    intensity risk_intensity not null default 'MEDIUM',
    location text,
    is_resolved boolean not null default false,
    resolved_at timestamptz,
    resolved_by uuid references profiles(user_id),
    created_by uuid references profiles(user_id),
    created_at timestamptz not null default now()
);

create index if not exists idx_risk_alerts_project on risk_alerts(project_id);
create index if not exists idx_risk_alerts_intensity on risk_alerts(intensity);

-- ============================================================
-- DISBURSEMENTS
-- ============================================================

DO $$ BEGIN
    CREATE TYPE disbursement_status AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

create table if not exists disbursements (
    id uuid primary key default gen_random_uuid(),
    project_id uuid not null references projects(id) on delete cascade,
    milestone_id uuid references milestones(id) on delete set null,
    amount numeric(18,2) not null check (amount > 0),
    currency text not null default 'NGN',
    status disbursement_status not null default 'PENDING',
    description text,
    approved_by uuid references profiles(user_id),
    approved_at timestamptz,
    created_at timestamptz not null default now()
);

create index if not exists idx_disbursements_project on disbursements(project_id);
create index if not exists idx_disbursements_status on disbursements(status);

-- ============================================================
-- BUDGET ALLOCATIONS (per-project budget tracking)
-- ============================================================

create table if not exists budget_allocations (
    id uuid primary key default gen_random_uuid(),
    project_id uuid not null references projects(id) on delete cascade,
    allocated_amount numeric(18,2) not null default 0,
    disbursed_amount numeric(18,2) not null default 0,
    spent_amount numeric(18,2) not null default 0,
    fiscal_year integer not null default extract(year from now()),
    updated_at timestamptz not null default now(),
    unique(project_id, fiscal_year)
);

create index if not exists idx_budget_alloc_project on budget_allocations(project_id);

-- ============================================================
-- REPORT TEMPLATES
-- ============================================================

DO $$ BEGIN
    CREATE TYPE report_format AS ENUM ('PDF', 'EXCEL', 'CSV');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

create table if not exists report_templates (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    description text,
    format report_format not null default 'PDF',
    file_size text,
    last_generated_at timestamptz,
    generated_by uuid references profiles(user_id),
    is_active boolean not null default true,
    created_at timestamptz not null default now()
);

-- ============================================================
-- MONTHLY PERFORMANCE SNAPSHOTS (chart data)
-- ============================================================

create table if not exists performance_snapshots (
    id uuid primary key default gen_random_uuid(),
    month integer not null check (month between 1 and 12),
    year integer not null,
    planned_progress numeric(5,2) not null default 0,
    actual_progress numeric(5,2) not null default 0,
    project_count integer not null default 0,
    total_disbursed numeric(18,2) not null default 0,
    created_at timestamptz not null default now(),
    unique(month, year)
);

create index if not exists idx_perf_snapshots_year on performance_snapshots(year);

-- ============================================================
-- RLS POLICIES
-- ============================================================

-- Risk alerts: admins and consultants can read
alter table risk_alerts enable row level security;
drop policy if exists "Anyone authenticated can view risk alerts" on risk_alerts;
create policy "Anyone authenticated can view risk alerts"
    on risk_alerts for select to authenticated using (true);
drop policy if exists "Admins can manage risk alerts" on risk_alerts;
create policy "Admins can manage risk alerts"
    on risk_alerts for all to authenticated
    using (exists (select 1 from profiles where user_id = auth.uid() and role = 'ADMIN'));

-- Disbursements: admins can read/write, consultants can read
alter table disbursements enable row level security;
drop policy if exists "Authenticated users can view disbursements" on disbursements;
create policy "Authenticated users can view disbursements"
    on disbursements for select to authenticated using (true);
drop policy if exists "Admins can manage disbursements" on disbursements;
create policy "Admins can manage disbursements"
    on disbursements for all to authenticated
    using (exists (select 1 from profiles where user_id = auth.uid() and role = 'ADMIN'));

-- Budget allocations: read for authenticated, write for admins
alter table budget_allocations enable row level security;
drop policy if exists "Authenticated users can view budget allocations" on budget_allocations;
create policy "Authenticated users can view budget allocations"
    on budget_allocations for select to authenticated using (true);
drop policy if exists "Admins can manage budget allocations" on budget_allocations;
create policy "Admins can manage budget allocations"
    on budget_allocations for all to authenticated
    using (exists (select 1 from profiles where user_id = auth.uid() and role = 'ADMIN'));

-- Report templates: read for all authenticated
alter table report_templates enable row level security;
drop policy if exists "Authenticated users can view report templates" on report_templates;
create policy "Authenticated users can view report templates"
    on report_templates for select to authenticated using (true);
drop policy if exists "Admins can manage report templates" on report_templates;
create policy "Admins can manage report templates"
    on report_templates for all to authenticated
    using (exists (select 1 from profiles where user_id = auth.uid() and role = 'ADMIN'));

-- Performance snapshots: read for all authenticated
alter table performance_snapshots enable row level security;
drop policy if exists "Authenticated users can view performance snapshots" on performance_snapshots;
create policy "Authenticated users can view performance snapshots"
    on performance_snapshots for select to authenticated using (true);
drop policy if exists "Admins can manage performance snapshots" on performance_snapshots;
create policy "Admins can manage performance snapshots"
    on performance_snapshots for all to authenticated
    using (exists (select 1 from profiles where user_id = auth.uid() and role = 'ADMIN'));

-- ============================================================
-- ADMIN NOTIFICATIONS
-- ============================================================

DO $$ BEGIN
    CREATE TYPE notification_type AS ENUM ('INFO', 'SUCCESS', 'WARNING', 'ERROR');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

create table if not exists admin_notifications (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    message text not null,
    type notification_type not null default 'INFO',
    source text not null default 'System',
    is_read boolean not null default false,
    target_user_id uuid references profiles(user_id) on delete cascade,
    created_at timestamptz not null default now()
);

create index if not exists idx_admin_notif_user on admin_notifications(target_user_id);
create index if not exists idx_admin_notif_read on admin_notifications(is_read);

alter table admin_notifications enable row level security;
drop policy if exists "Users can view their own notifications" on admin_notifications;
create policy "Users can view their own notifications"
    on admin_notifications for select to authenticated
    using (target_user_id = auth.uid() or target_user_id is null);
drop policy if exists "Users can update their own notifications" on admin_notifications;
create policy "Users can update their own notifications"
    on admin_notifications for update to authenticated
    using (target_user_id = auth.uid() or target_user_id is null);
drop policy if exists "Admins can manage all notifications" on admin_notifications;
create policy "Admins can manage all notifications"
    on admin_notifications for all to authenticated
    using (exists (select 1 from profiles where user_id = auth.uid() and role = 'ADMIN'));
