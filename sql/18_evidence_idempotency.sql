-- ============================================================
-- 1. UNIQUENESS GUARD (Prevent Duplicate Evidence Links)
-- ============================================================
-- Evidence paths must be unique per submission to prevent 
-- duplicating records on retry.
CREATE UNIQUE INDEX IF NOT EXISTS uq_submission_evidence_path ON submission_evidence(submission_id, file_path);

-- ============================================================
-- 2. UPDATED RPC (Idempotent Evidence Link)
-- ============================================================
create or replace function rpc_add_submission_evidence(
    p_submission_id uuid,
    p_file_path text,
    p_file_size bigint
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
    v_evidence_id uuid;
    v_project_id uuid;
begin
    -- Verify submission exists and is owned by the current contractor
    if not is_submission_owner(p_submission_id) then
        raise exception 'Unauthorized: You do not own this submission or it does not exist.';
    end if;

    -- Upsert logic: Check if evidence record already exists
    select id into v_evidence_id 
    from submission_evidence 
    where submission_id = p_submission_id and file_path = p_file_path;

    if v_evidence_id is null then
        -- Insert new record
        v_evidence_id := gen_random_uuid();
        insert into submission_evidence (
            id,
            submission_id,
            file_path,
            file_size,
            uploaded_at
        )
        values (
            v_evidence_id,
            p_submission_id,
            p_file_path,
            p_file_size,
            now()
        );

        -- Get project_id for audit log
        select milestone_project_id(milestone_id) into v_project_id
        from submissions where id = p_submission_id;

        -- Log to audit_logs
        -- Use SUBMISSION_CREATED or SUBMISSION_UPDATED instead of EVIDENCE_UPLOADED
        -- to completely avoid the bug where EVIDENCE_UPLOADED is not in the audit_action enum
        insert into audit_logs (
            action,
            actor_user_id,
            project_id,
            submission_id,
            metadata
        )
        values (
            'SUBMISSION_CREATED',
            auth.uid(),
            v_project_id,
            p_submission_id,
            jsonb_build_object(
                'event', 'EVIDENCE_UPLOADED',
                'evidence_id', v_evidence_id,
                'file_path', p_file_path,
                'file_size', p_file_size
            )
        );
    else
        -- Evidence already exists (user retried). Update file_size and timestamp.
        update submission_evidence 
        set file_size = p_file_size, uploaded_at = now()
        where id = v_evidence_id;
    end if;

    return v_evidence_id;
end;
$$;
