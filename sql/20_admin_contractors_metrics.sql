-- ============================================================
-- 20_admin_contractors_metrics.sql
-- Update RPC for admin to list contractors with active project counts, total projects, and rating
-- Fixed version: counts projects from section_assignments and removes missing performance_rating
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
                -- Count unique projects they have assigned sections in
                COALESCE((
                    SELECT COUNT(DISTINCT s.project_id) 
                    FROM section_assignments sa
                    JOIN sections s ON sa.section_id = s.id
                    WHERE sa.contractor_user_id = p.user_id
                ), 0) as project_count,
                
                -- Count active unique projects they have assigned sections in
                COALESCE((
                    SELECT COUNT(DISTINCT s.project_id) 
                    FROM section_assignments sa 
                    JOIN sections s ON sa.section_id = s.id 
                    JOIN projects pr ON s.project_id = pr.id 
                    WHERE sa.contractor_user_id = p.user_id AND pr.status = 'ACTIVE'
                ), 0) as active_projects,
                
                -- Average rating and reviews (Currently unsupported in DB schema)
                0 as average_rating,
                0 as total_reviews
            FROM profiles p
            JOIN auth.users au ON au.id = p.user_id
            LEFT JOIN contractor_profiles cp ON cp.user_id = p.user_id
            WHERE p.role = 'CONTRACTOR'
            ORDER BY p.created_at DESC
        ) t
    );
END;
$$;
