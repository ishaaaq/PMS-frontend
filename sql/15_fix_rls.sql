-- ============================================================
-- COMPREHENSIVE RLS FIX
-- Recreates is_admin() and all critical RLS policies
-- Run in Supabase SQL Editor with Role: postgres
-- ============================================================

-- ============================================================
-- STEP 1: Recreate is_admin() from scratch
-- ============================================================
DROP FUNCTION IF EXISTS is_admin() CASCADE;

CREATE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM profiles
        WHERE user_id = auth.uid()
        AND role = 'ADMIN'
        AND is_active = true
    );
$$;

-- ============================================================
-- STEP 2: Recreate is_project_consultant()
-- ============================================================
CREATE OR REPLACE FUNCTION is_project_consultant(p_project_id uuid)
RETURNS boolean
LANGUAGE sql STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM project_consultants pc
        WHERE pc.project_id = p_project_id
        AND pc.consultant_user_id = auth.uid()
    );
$$;

-- ============================================================
-- STEP 3: Fix PROFILES RLS
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_self_read" ON profiles;
DROP POLICY IF EXISTS "profiles_block_writes" ON profiles;
DROP POLICY IF EXISTS "profiles_block_inserts" ON profiles;
DROP POLICY IF EXISTS "profiles_block_updates" ON profiles;
DROP POLICY IF EXISTS "profiles_block_deletes" ON profiles;

CREATE POLICY "profiles_self_read" ON profiles FOR SELECT
USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "profiles_block_inserts" ON profiles FOR INSERT
WITH CHECK (false);

CREATE POLICY "profiles_block_updates" ON profiles FOR UPDATE
USING (false) WITH CHECK (false);

CREATE POLICY "profiles_block_deletes" ON profiles FOR DELETE
USING (false);

-- ============================================================
-- STEP 4: Fix PROJECTS RLS
-- ============================================================
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_full_projects" ON projects;
DROP POLICY IF EXISTS "consultant_projects" ON projects;

CREATE POLICY "admin_full_projects" ON projects FOR SELECT
USING (is_admin());

CREATE POLICY "consultant_projects" ON projects FOR SELECT
USING (is_project_consultant(id));

-- ============================================================
-- STEP 5: Fix PROJECT_CONSULTANTS RLS
-- ============================================================
ALTER TABLE project_consultants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_manage_consultants" ON project_consultants;
DROP POLICY IF EXISTS "consultant_see_own" ON project_consultants;

CREATE POLICY "admin_manage_consultants" ON project_consultants FOR ALL
USING (is_admin());

CREATE POLICY "consultant_see_own" ON project_consultants FOR SELECT
USING (consultant_user_id = auth.uid());

-- ============================================================
-- STEP 6: Fix MILESTONES RLS
-- ============================================================
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_full_milestones" ON milestones;
DROP POLICY IF EXISTS "consultant_milestones" ON milestones;
DROP POLICY IF EXISTS "contractor_milestones" ON milestones;

CREATE POLICY "admin_full_milestones" ON milestones FOR SELECT
USING (is_admin());

CREATE POLICY "consultant_milestones" ON milestones FOR SELECT
USING (is_project_consultant(project_id));

CREATE POLICY "contractor_milestones" ON milestones FOR SELECT
USING (EXISTS (
    SELECT 1 FROM section_milestones sm
    JOIN section_assignments sa ON sa.section_id = sm.section_id
    WHERE sm.milestone_id = milestones.id
    AND sa.contractor_user_id = auth.uid()
));

-- ============================================================
-- STEP 7: Fix SUBMISSIONS RLS
-- ============================================================
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_full_submissions" ON submissions;
DROP POLICY IF EXISTS "consultant_read_submissions" ON submissions;
DROP POLICY IF EXISTS "contractor_own_submissions" ON submissions;

CREATE POLICY "admin_full_submissions" ON submissions FOR SELECT
USING (is_admin());

CREATE POLICY "consultant_read_submissions" ON submissions FOR SELECT
USING (is_project_consultant(milestone_project_id(milestone_id)));

CREATE POLICY "contractor_own_submissions" ON submissions FOR SELECT
USING (contractor_user_id = auth.uid());

-- ============================================================
-- STEP 8: Fix PROJECT_CONTRACTORS RLS
-- ============================================================
ALTER TABLE project_contractors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_manage_project_contractors" ON project_contractors;
DROP POLICY IF EXISTS "contractor_see_own_assignments" ON project_contractors;
DROP POLICY IF EXISTS "consultant_see_project_contractors" ON project_contractors;

CREATE POLICY "admin_manage_project_contractors" ON project_contractors FOR ALL
USING (is_admin());

CREATE POLICY "contractor_see_own_assignments" ON project_contractors FOR SELECT
USING (contractor_user_id = auth.uid());

CREATE POLICY "consultant_see_project_contractors" ON project_contractors FOR SELECT
USING (is_project_consultant(project_id));

-- ============================================================
-- STEP 9: Fix RISK_ALERTS, PERFORMANCE_SNAPSHOTS, etc.
-- ============================================================
ALTER TABLE risk_alerts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admin_read_risk_alerts" ON risk_alerts;
CREATE POLICY "admin_read_risk_alerts" ON risk_alerts FOR SELECT USING (is_admin());

ALTER TABLE performance_snapshots ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admin_read_perf_snapshots" ON performance_snapshots;
CREATE POLICY "admin_read_perf_snapshots" ON performance_snapshots FOR SELECT USING (is_admin());

ALTER TABLE budget_allocations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admin_read_budget" ON budget_allocations;
CREATE POLICY "admin_read_budget" ON budget_allocations FOR SELECT USING (is_admin());

ALTER TABLE disbursements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admin_read_disbursements" ON disbursements;
CREATE POLICY "admin_read_disbursements" ON disbursements FOR SELECT USING (is_admin());

-- ============================================================
-- STEP 10: Verify is_admin works
-- ============================================================
SELECT 'is_admin function exists' AS check,
       pg_get_functiondef(oid) AS definition
FROM pg_proc WHERE proname = 'is_admin';

-- Verify the admin profile
SELECT user_id, role, full_name, is_active FROM profiles
WHERE user_id = '25db755d-a4eb-4b35-bb7c-77d52d51675e';
