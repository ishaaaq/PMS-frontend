-- ============================================================
-- SQL MIGRATION: 09_enforce_mfa.sql
-- ============================================================

-- ============================================================
-- 4. ENFORCE MFA / AAL2
-- ============================================================
-- In Supabase, auth.jwt() ->> 'aal' gives 'aal1' for password login, and 'aal2' for MFA.
-- The requirement states: "Require: auth.jwt() ->> 'aal' = 'aal2'" for Admin, Consultant, and Contractor role checks.

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
        and auth.jwt() ->> 'aal' = 'aal2'
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
        and auth.jwt() ->> 'aal' = 'aal2'
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
        and auth.jwt() ->> 'aal' = 'aal2'
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
        and auth.jwt() ->> 'aal' = 'aal2'
    );
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
    and auth.jwt() ->> 'aal' = 'aal2'
  );
$$;

-- We also need to update the basic contractor view policy function (for projects, etc if it exists as a helper) or direct queries relying on auth.uid()
-- While direct queries might not use a helper, ensuring the critical write/read helpers have AAL2 covers the MVP requirement. The requirement explicitly said:
-- "Modify helper role checks: is_admin(), is_project_consultant(), any contractor membership checks"

-- A contractor checking their own section assignment:
drop policy if exists "contractor_section_assignments_self" on section_assignments;
create policy "contractor_section_assignments_self"
on section_assignments for select
using (contractor_user_id = auth.uid() and auth.jwt() ->> 'aal' = 'aal2');

drop policy if exists "contractor_view_assigned_projects" on projects;
create policy "contractor_view_assigned_projects"
on projects for select
using (
    exists (
        select 1 
        from section_assignments sa
        join sections s on s.id = sa.section_id
        where s.project_id = projects.id
        and sa.contractor_user_id = auth.uid()
        and auth.jwt() ->> 'aal' = 'aal2'
    )
);

drop policy if exists "contractor_submissions" on submissions;
create policy "contractor_submissions"
on submissions for select
using (
    contractor_user_id = auth.uid()
    and auth.jwt() ->> 'aal' = 'aal2'
);

drop policy if exists "contractor_section_milestones" on section_milestones;
create policy "contractor_section_milestones"
on section_milestones for select
using (
  exists (
    select 1 from section_assignments sa
    where sa.section_id = section_milestones.section_id
    and sa.contractor_user_id = auth.uid()
    and auth.jwt() ->> 'aal' = 'aal2'
  )
);

drop policy if exists "contractor_notification_deliveries" on notification_deliveries;
create policy "contractor_notification_deliveries"
on notification_deliveries for select
using (contractor_user_id = auth.uid() and auth.jwt() ->> 'aal' = 'aal2');

drop policy if exists "contractor_mark_read" on notification_deliveries;
create policy "contractor_mark_read"
on notification_deliveries for update
using (contractor_user_id = auth.uid() and auth.jwt() ->> 'aal' = 'aal2')
with check (contractor_user_id = auth.uid() and auth.jwt() ->> 'aal' = 'aal2');

-- Also enforce on direct profile reads if desired, though profiles_self_read is low risk.
drop policy if exists "profiles_self_read" on profiles;
create policy "profiles_self_read"
on profiles for select
using ( (user_id = auth.uid() and auth.jwt() ->> 'aal' = 'aal2') OR is_admin());
