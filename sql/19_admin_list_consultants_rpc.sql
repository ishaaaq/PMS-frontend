-- ============================================================
-- 19_admin_list_consultants_rpc.sql
-- RPC for admin to list all consultants with full details
-- including email from auth.users and extended profile
-- ============================================================

CREATE OR REPLACE FUNCTION rpc_admin_list_consultants()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Admin only
    IF NOT is_admin() THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    RETURN (
        SELECT json_agg(row_to_json(t))
        FROM (
            SELECT
                p.user_id,
                p.full_name,
                p.role,
                p.phone,
                p.is_active,
                p.created_at,
                au.email,
                cp.specialization,
                cp.department,
                cp.region
            FROM profiles p
            JOIN auth.users au ON au.id = p.user_id
            LEFT JOIN consultant_profiles cp ON cp.user_id = p.user_id
            WHERE p.role = 'CONSULTANT'
            ORDER BY p.created_at DESC
        ) t
    );
END;
$$;
