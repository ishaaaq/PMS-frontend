-- Temporary debug RPC to see all assignments
CREATE OR REPLACE FUNCTION rpc_debug_all_assignments()
RETURNS TABLE (
    project_id uuid,
    consultant_user_id uuid,
    project_title text,
    project_status text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pc.project_id,
        pc.consultant_user_id,
        pr.title,
        pr.status::text
    FROM project_consultants pc
    JOIN projects pr ON pc.project_id = pr.id;
END;
$$;
