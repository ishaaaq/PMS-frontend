-- ============================================================
-- ALLOW ADMINS TO UPDATE PROJECTS AND MILESTONES
-- ============================================================
-- The existing "projects_block_writes" and "milestones_block_writes" 
-- policies block all direct writes to those tables. 
-- Since permissive RLS policies behave with OR logic, we can explicitly 
-- add permissive policies to allow ADMIN users to update rows 
-- directly from the frontend UI.

CREATE POLICY "admin_update_projects"
ON projects FOR UPDATE
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "admin_update_milestones"
ON milestones FOR UPDATE
USING (is_admin())
WITH CHECK (is_admin());
