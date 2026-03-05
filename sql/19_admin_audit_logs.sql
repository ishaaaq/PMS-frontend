-- ============================================================
-- 19_admin_audit_logs.sql
-- Adds an RPC to fetch a user's recent activity securely.
-- Bypasses complex RLS on audit_logs by using SECURITY DEFINER and explicit admin checks.
-- ============================================================

CREATE OR REPLACE FUNCTION rpc_get_user_recent_activity(
    p_user_id uuid,
    p_limit int DEFAULT 15
)
RETURNS TABLE (
    id uuid,
    action audit_action,
    actor_user_id uuid,
    project_id uuid,
    section_id uuid,
    milestone_id uuid,
    submission_id uuid,
    metadata jsonb,
    created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Only admins can view any user's activity log arbitrarily
    IF NOT is_admin() THEN
        RAISE EXCEPTION 'Unauthorized: Only administrators can view user activity logs.';
    END IF;

    RETURN QUERY
    SELECT 
        a.id,
        a.action,
        a.actor_user_id,
        a.project_id,
        a.section_id,
        a.milestone_id,
        a.submission_id,
        a.metadata,
        a.created_at
    FROM audit_logs a
    WHERE a.actor_user_id = p_user_id
    ORDER BY a.created_at DESC
    LIMIT p_limit;
END;
$$;
