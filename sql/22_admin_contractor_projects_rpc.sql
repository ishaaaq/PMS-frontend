-- ============================================================
-- 22_admin_contractor_projects_rpc.sql
-- RPC to fetch a contractor's assigned projects for the Admin UI,
-- bypassing RLS policies that block complex nested joins.
-- ============================================================

CREATE OR REPLACE FUNCTION rpc_admin_contractor_projects(p_contractor_user_id uuid)
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
        0::numeric AS rating -- Rating doesn't exist in DB schemas yet
    FROM section_assignments sa
    JOIN sections s ON sa.section_id = s.id
    JOIN projects pr ON s.project_id = pr.id
    WHERE sa.contractor_user_id = p_contractor_user_id
    ORDER BY pr.created_at DESC;
END;
$$;
