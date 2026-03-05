-- ============================================================
-- 20_admin_contractors_metrics.sql
-- Update RPC for admin to list contractors with active project counts, total projects, and rating
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
                cp.zone,
                COALESCE((SELECT COUNT(*) FROM project_contractors pc WHERE pc.contractor_user_id = p.user_id), 0) as project_count,
                COALESCE((
                    SELECT COUNT(*) 
                    FROM project_contractors pc 
                    JOIN projects pr ON pc.project_id = pr.id 
                    WHERE pc.contractor_user_id = p.user_id AND pr.status = 'ACTIVE'
                ), 0) as active_projects,
                COALESCE((
                    SELECT AVG(performance_rating) 
                    FROM project_contractors pc 
                    WHERE pc.contractor_user_id = p.user_id AND performance_rating IS NOT NULL
                ), 0) as average_rating,
                COALESCE((
                    SELECT COUNT(*) 
                    FROM project_contractors pc 
                    WHERE pc.contractor_user_id = p.user_id AND performance_rating IS NOT NULL
                ), 0) as total_reviews
            FROM profiles p
            JOIN auth.users au ON au.id = p.user_id
            LEFT JOIN contractor_profiles cp ON cp.user_id = p.user_id
            WHERE p.role = 'CONTRACTOR'
            ORDER BY p.created_at DESC
        ) t
    );
END;
$$;
