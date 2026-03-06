-- ============================================================
-- 30_archive_projects.sql
-- ISO 27001 Archiving System
-- ============================================================
-- Rather than hard-deleting projects, we archive them.
-- This guarantees data retention and allows the project to be hidden from standard views.

-- 1. Add the column
ALTER TABLE projects ADD COLUMN IF NOT EXISTS is_archived boolean NOT NULL DEFAULT false;

-- 2. Add an index to speed up list queries where we filter out archived items
CREATE INDEX IF NOT EXISTS idx_projects_archived ON projects(is_archived);
