-- ============================================================
-- ALLOW ADMINS TO DELETE PROJECTS
-- ============================================================
-- Explicitly creates a permissive DELETE policy for ADMIN users
-- overriding the strict 'projects_block_writes' policy which
-- normally blocks all DELETE operations. 
-- Due to existing 'ON DELETE CASCADE' rules, deleting a project
-- will safely delete all associated milestones, sections, metrics, etc.

CREATE POLICY "admin_delete_projects"
ON projects FOR DELETE
USING (is_admin());
