-- ============================================================
-- ALLOW ADMINS TO CASCADE DELETE PROJECTS
-- ============================================================
-- PostgreSQL evaluates RLS on child tables during an `ON DELETE CASCADE`.
-- Since tables like `milestones`, `sections`, etc. have a `block_writes` 
-- policy that denies all writes, the project deletion is failing when 
-- the database attempts to cascade the delete downwards.
-- This script explicitly grants ADMINs the `DELETE` permission on all 
-- child tables involved in a project's cascading delete path.

CREATE POLICY "admin_delete_project_consultants" ON project_consultants FOR DELETE USING (is_admin());
CREATE POLICY "admin_delete_milestones" ON milestones FOR DELETE USING (is_admin());
CREATE POLICY "admin_delete_sections" ON sections FOR DELETE USING (is_admin());
CREATE POLICY "admin_delete_section_milestones" ON section_milestones FOR DELETE USING (is_admin());
CREATE POLICY "admin_delete_section_assignments" ON section_assignments FOR DELETE USING (is_admin());
CREATE POLICY "admin_delete_submissions" ON submissions FOR DELETE USING (is_admin());
CREATE POLICY "admin_delete_submission_evidence" ON submission_evidence FOR DELETE USING (is_admin());
CREATE POLICY "admin_delete_submission_materials" ON submission_materials FOR DELETE USING (is_admin());
CREATE POLICY "admin_delete_notifications" ON notifications FOR DELETE USING (is_admin());
CREATE POLICY "admin_delete_notification_deliveries" ON notification_deliveries FOR DELETE USING (is_admin());
CREATE POLICY "admin_delete_project_comments" ON project_comments FOR DELETE USING (is_admin());
CREATE POLICY "admin_delete_project_contractors" ON project_contractors FOR DELETE USING (is_admin());
CREATE POLICY "admin_delete_risk_alerts" ON risk_alerts FOR DELETE USING (is_admin());
CREATE POLICY "admin_delete_disbursements" ON disbursements FOR DELETE USING (is_admin());
CREATE POLICY "admin_delete_budget_allocations" ON budget_allocations FOR DELETE USING (is_admin());
CREATE POLICY "admin_delete_invitations" ON invitations FOR DELETE USING (is_admin());
