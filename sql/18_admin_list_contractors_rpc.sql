-- ============================================================
-- 18_admin_list_contractors_rpc.sql
-- RPC for admin to list all contractors with full details
-- including email from auth.users
-- ============================================================

CREATE OR REPLACE FUNCTION rpc_admin_list_contractors()
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
                cp.company_name,
                cp.registration_number,
                cp.zone
            FROM profiles p
            JOIN auth.users au ON au.id = p.user_id
            LEFT JOIN contractor_profiles cp ON cp.user_id = p.user_id
            WHERE p.role = 'CONTRACTOR'
            ORDER BY p.created_at DESC
        ) t
    );
END;
$$;
