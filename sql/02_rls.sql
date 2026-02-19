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
