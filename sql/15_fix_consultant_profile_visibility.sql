-- ============================================================
-- SQL MIGRATION: 15_fix_consultant_profile_visibility.sql
-- Problem: Consultants cannot see other users' profiles (RLS:
--          profiles_self_read allows only user_id = auth.uid()
--          OR is_admin()). This causes "Unknown" for comment
--          authors and contractor names in submissions.
-- Solution: Two SECURITY DEFINER RPCs that join profiles
--           server-side, following the same pattern as
--           rpc_get_project_contractors in 06_fix_profiles_rls.sql.
-- ============================================================

-- ============================================================
-- 1. RPC: Get project comments with author profile info
-- ============================================================

create or replace function rpc_get_project_comments_with_authors(p_project_id uuid)
returns table (
    comment_id uuid,
    body text,
    created_at timestamptz,
    author_user_id uuid,
    author_full_name text,
    author_role text
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
            pc.id          as comment_id,
            pc.body,
            pc.created_at,
            pc.author_user_id,
            p.full_name    as author_full_name,
            p.role::text   as author_role
        from project_comments pc
        join profiles p on p.user_id = pc.author_user_id
        where pc.project_id = p_project_id
        order by pc.created_at desc;
end;
$$;


-- ============================================================
-- 2. RPC: Get project submissions with contractor & reviewer
--         profile info and milestone title
-- ============================================================

create or replace function rpc_get_project_submissions_with_profiles(p_project_id uuid)
returns table (
    submission_id uuid,
    milestone_id uuid,
    milestone_title text,
    milestone_due_date date,
    milestone_budget numeric,
    contractor_user_id uuid,
    contractor_full_name text,
    contractor_role text,
    reviewer_full_name text,
    status text,
    work_description text,
    query_note text,
    submitted_at timestamptz,
    reviewed_at timestamptz
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
            s.id                    as submission_id,
            s.milestone_id,
            m.title                 as milestone_title,
            m.due_date              as milestone_due_date,
            m.budget                as milestone_budget,
            s.contractor_user_id,
            cp.full_name            as contractor_full_name,
            cp.role::text           as contractor_role,
            rp.full_name            as reviewer_full_name,
            s.status::text,
            s.work_description,
            s.query_note,
            s.submitted_at,
            s.reviewed_at
        from submissions s
        join milestones m on m.id = s.milestone_id
        join profiles cp on cp.user_id = s.contractor_user_id
        left join profiles rp on rp.user_id = s.reviewed_by_consultant_id
        where m.project_id = p_project_id
        order by s.submitted_at desc;
end;
$$;


-- ============================================================
-- 3. RPC: Get contractor notifications with full content
-- Problem: notifications table RLS only allows consultant reads
--          (is_project_consultant). Contractors can read their
--          notification_deliveries but the PostgREST join to
--          notifications returns null, causing fallback titles.
-- Solution: SECURITY DEFINER RPC that joins server-side.
-- ============================================================

create or replace function rpc_get_contractor_notifications()
returns table (
    notification_id uuid,
    title text,
    message text,
    created_at timestamptz,
    is_read boolean,
    read_at timestamptz,
    section_name text,
    project_title text
)
language plpgsql
security definer
set search_path = public
as $$
begin
    -- No auth check needed beyond auth.uid() — the WHERE clause
    -- guarantees we only return deliveries for the calling user.
    return query
        select
            n.id            as notification_id,
            n.title,
            n.message,
            n.created_at,
            nd.is_read,
            nd.read_at,
            s.name          as section_name,
            p.title         as project_title
        from notification_deliveries nd
        join notifications n on n.id = nd.notification_id
        join sections s on s.id = n.section_id
        join projects p on p.id = s.project_id
        where nd.contractor_user_id = auth.uid()
        order by n.created_at desc;
end;
$$;
