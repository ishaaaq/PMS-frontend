-- Temporary script to dump all submission evidence rows
CREATE OR REPLACE FUNCTION rpc_debug_all_evidence()
RETURNS TABLE (
    evidence_id uuid,
    sub_id uuid,
    file_path text,
    file_type text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        se.id,
        se.submission_id,
        se.file_path,
        se.file_type
    FROM submission_evidence se
    ORDER BY se.uploaded_at ASC;
END;
$$;
