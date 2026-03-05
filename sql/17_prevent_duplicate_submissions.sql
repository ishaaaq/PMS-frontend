-- ============================================================
-- 1. UNIQUENESS GUARD (Prevent Duplicate Active Submissions)
-- ============================================================
-- A contractor should only ever have ONE active submission (either PENDING or QUERIED) 
-- per milestone at any given time.

-- CLEANUP EXISTING DUPLICATES FIRST
-- Keep only the most recent active submission for any contractor-milestone pair
WITH duplicates AS (
    SELECT id, 
           ROW_NUMBER() OVER (
               PARTITION BY contractor_user_id, milestone_id 
               ORDER BY submitted_at DESC
           ) as row_num
    FROM submissions
    WHERE status IN ('PENDING_APPROVAL', 'QUERIED')
)
DELETE FROM submissions 
WHERE id IN (
    SELECT id 
    FROM duplicates 
    WHERE row_num > 1
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_submissions_active_unique 
ON submissions (contractor_user_id, milestone_id) 
WHERE status IN ('PENDING_APPROVAL', 'QUERIED');

-- ============================================================
-- 2. UPDATED RPC (Idempotent submission creation)
-- ============================================================
create or replace function rpc_create_submission(
    p_milestone_id uuid,
    p_work_description text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
    v_submission_id uuid;
    v_project_id uuid;
begin
    if not milestone_belongs_to_section_for_contractor(p_milestone_id) then   
        raise exception 'Unauthorized';
    end if;

    -- Idempotency / Resubmission logic: 
    -- If there's an active submission for this milestone, return it and update the description.
    select id into v_submission_id
    from submissions
    where milestone_id = p_milestone_id
      and contractor_user_id = auth.uid()
      and status in ('PENDING_APPROVAL', 'QUERIED')
    limit 1;

    if v_submission_id is not null then
        update submissions
        set work_description = p_work_description,
            status = 'PENDING_APPROVAL',
            submitted_at = now()
        where id = v_submission_id;
        
        return v_submission_id;
    end if;

    -- Otherwise, insert a new submission
    insert into submissions (
        milestone_id,
        contractor_user_id,
        work_description,
        status
    )
    values (
        p_milestone_id,
        auth.uid(),
        p_work_description,
        'PENDING_APPROVAL'
    )
    returning id into v_submission_id;

    -- Update milestone status
    update milestones
    set status = 'IN_PROGRESS'
    where id = p_milestone_id
    and status = 'NOT_STARTED';

    -- Get project ID for audit log
    select milestone_project_id(p_milestone_id) into v_project_id;

    -- Log action (NOTE: Fixed bug in original function where 'return' happened before this insert)
    insert into audit_logs (
        action,
        actor_user_id,
        project_id,
        milestone_id,
        submission_id,
        metadata
    )
    values (
        'SUBMISSION_CREATED',
        auth.uid(),
        v_project_id,
        p_milestone_id,
        v_submission_id,
        jsonb_build_object('milestone_id', p_milestone_id)
    );

    return v_submission_id;
end;
$$;
