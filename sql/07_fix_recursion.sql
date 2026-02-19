-- ============================================================
-- SQL MIGRATION: FIX RECURSIVE RLS POLICIES
-- Problem: Infinite recursion (Stack Depth Limit Exceeded) when querying sections/assignments.
--          sections -> RLS (is_section_contractor) -> section_assignments -> RLS (consultant_section_assignments) -> sections ...
-- Solution: valid helper functions used in RLS should be SECURITY DEFINER to bypass RLS on the lookup tables.
-- ============================================================

-- Fix is_section_contractor to bypass RLS on section_assignments
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

-- Fix is_project_consultant to bypass RLS on project_consultants (optimization/safety)
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

-- Fix is_admin to bypass RLS on profiles (optimization/safety)
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
