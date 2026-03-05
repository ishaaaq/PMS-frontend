-- ============================================================
-- SECURE PROJECT DELETION RPC
-- ============================================================
-- Context: Deleting a project triggers a massive ON DELETE CASCADE chain
-- that hits dozens of tables and encounters multiple blocking RLS 
-- policies (especially ON DELETE SET NULL which triggers UPDATE checks).
-- Using a SECURITY DEFINER function here ensures that the delete operation
-- reliably completes and bypasses RLS, as long as the caller is an Admin.

CREATE OR REPLACE FUNCTION rpc_delete_project(p_project_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- 1. Verify Authorization (Admin Only)
    IF NOT is_admin() THEN
        RAISE EXCEPTION 'Unauthorized: Only admins can delete projects';
    END IF;

    -- 2. Execute deletion safely (Cascades automatically as table owner)
    DELETE FROM projects WHERE id = p_project_id;
END;
$$;
