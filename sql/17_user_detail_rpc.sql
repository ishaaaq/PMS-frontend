-- ============================================================
-- 17_user_detail_rpc.sql
-- RPC for admin to fetch a user's full detail
-- including email from auth.users and extended profile
-- ============================================================

CREATE OR REPLACE FUNCTION rpc_get_user_detail(p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_result JSON;
BEGIN
    -- Admin only
    IF NOT is_admin() THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    SELECT json_build_object(
        'user_id', p.user_id,
        'full_name', p.full_name,
        'role', p.role,
        'phone', p.phone,
        'is_active', p.is_active,
        'created_at', p.created_at,
        'email', au.email,
        -- Consultant extended profile
        'specialization', cp.specialization,
        'department', cp.department,
        'region', cp.region,
        -- Contractor extended profile
        'company_name', ctp.company_name,
        'registration_number', ctp.registration_number,
        'zone', ctp.zone
    )
    INTO v_result
    FROM profiles p
    JOIN auth.users au ON au.id = p.user_id
    LEFT JOIN consultant_profiles cp ON cp.user_id = p.user_id
    LEFT JOIN contractor_profiles ctp ON ctp.user_id = p.user_id
    WHERE p.user_id = p_user_id;

    IF v_result IS NULL THEN
        RAISE EXCEPTION 'User not found';
    END IF;

    RETURN v_result;
END;
$$;
