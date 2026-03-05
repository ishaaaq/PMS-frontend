-- ============================================================
-- 23_admin_consultant_projects_rpc.sql
-- RPC to fetch a consultant's assigned projects for the Admin UI,
-- bypassing RLS policies that block complex nested joins.
-- ============================================================

CREATE OR REPLACE FUNCTION rpc_admin_consultant_projects(p_consultant_user_id uuid)
RETURNS TABLE (
    id uuid,
    title text,
    status text,
    total_budget numeric,
    created_at timestamptz,
    rating numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Admin only
    IF NOT is_admin() THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    RETURN QUERY
    SELECT DISTINCT
        pr.id,
        pr.title,
        pr.status::text,
        pr.total_budget,
        pr.created_at,
        0::numeric AS rating
    FROM project_consultants pc
    JOIN projects pr ON pc.project_id = pr.id
    WHERE pc.consultant_user_id = p_consultant_user_id
    ORDER BY pr.created_at DESC;
END;
$$;
