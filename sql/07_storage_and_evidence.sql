-- ============================================================
-- SQL MIGRATION: 07_storage_and_evidence.sql
-- ============================================================

-- ============================================================
-- 1. STORAGE BUCKET & POLICIES
-- ============================================================

-- Ensure the bucket is private
update storage.buckets
set public = false
where id = 'submission-evidence';

-- Note: storage.objects usually has RLS enabled by default in Supabase.
-- 'alter table storage.objects enable row level security;' is omitted to avoid permission errors.

-- DROP existing policies if any to avoid conflicts during rerun
drop policy if exists "Contractors can upload own evidence" on storage.objects;
drop policy if exists "Authenticated users can read via signed URLs" on storage.objects;

-- INSERT POLICY:
--   - Only authenticated users.
--   - Only contractors uploading evidence for their own submission.
--   - Path MUST match: project/{projectId}/milestone/{milestoneId}/submission/{submissionId}/{filename}
--   - submissionId must belong to the contractor.
--   - milestoneId must belong to the section assigned to the contractor.
create policy "Contractors can upload own evidence"
on storage.objects for insert
to authenticated
with check (
    bucket_id = 'submission-evidence'
    and (storage.foldername(name))[1] = 'project'
    and (storage.foldername(name))[3] = 'milestone'
    and (storage.foldername(name))[5] = 'submission'
    and exists (
        select 1
        from submissions s
        join section_milestones sm on sm.milestone_id = s.milestone_id
        join section_assignments sa on sa.section_id = sm.section_id
        where 
            s.id = (storage.foldername(name))[6]::uuid
            and s.milestone_id = (storage.foldername(name))[4]::uuid
            and s.contractor_user_id = auth.uid()
            and sa.contractor_user_id = auth.uid()
    )
);

-- SELECT POLICY:
--   - Only via signed URLs (Supabase implicitly handles signed URL auth bypassing this policy if the signature is valid, 
--     but to be strictly correct for direct reads if ever allowed, we check if they can read the submission).
--   - Ensure no public access.
create policy "Authenticated users can read via signed URLs or directly if allowed"
on storage.objects for select
to authenticated
using (
    bucket_id = 'submission-evidence'
    and can_read_submission((storage.foldername(name))[6]::uuid)
);

-- ============================================================
-- 5. AUDIT LOGGING ENUM UPDATE (Part 1/2)
-- ============================================================
alter type audit_action add value if not exists 'EVIDENCE_UPLOADED';
alter type audit_action add value if not exists 'MATERIAL_UPLOADED';

-- ============================================================
-- 2. CREATE MISSING RPCs
-- ============================================================

-- rpc_add_submission_evidence
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
    v_evidence_id uuid := uuid_generate_v4();
    v_project_id uuid;
begin
    -- Verify submission exists and is owned by the current contractor
    if not is_submission_owner(p_submission_id) then
        raise exception 'Unauthorized: You do not own this submission or it does not exist.';
    end if;

    -- Extract file_type from file_path extension (simple approach)
    -- In a real app we might pass this, but we'll leave it null or extract
    
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
    insert into audit_logs (
        action,
        actor_user_id,
        project_id,
        submission_id,
        metadata
    )
    values (
        'EVIDENCE_UPLOADED',
        auth.uid(),
        v_project_id,
        p_submission_id,
        jsonb_build_object(
            'evidence_id', v_evidence_id,
            'file_path', p_file_path,
            'file_size', p_file_size
        )
    );

    return v_evidence_id;
end;
$$;


-- rpc_add_submission_material
create or replace function rpc_add_submission_material(
    p_submission_id uuid,
    p_material_name text,
    p_quantity numeric,
    p_unit text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
    v_material_id uuid := uuid_generate_v4();
    v_project_id uuid;
begin
    -- Verify submission exists and is owned by the current contractor
    if not is_submission_owner(p_submission_id) then
        raise exception 'Unauthorized: You do not own this submission or it does not exist.';
    end if;

    if p_quantity < 0 then
        raise exception 'Quantity cannot be negative.';
    end if;

    insert into submission_materials (
        id,
        submission_id,
        material_name,
        quantity,
        unit
    )
    values (
        v_material_id,
        p_submission_id,
        p_material_name,
        p_quantity,
        p_unit
    );

    -- Get project_id for audit log
    select milestone_project_id(milestone_id) into v_project_id
    from submissions where id = p_submission_id;

    -- Log to audit_logs
    insert into audit_logs (
        action,
        actor_user_id,
        project_id,
        submission_id,
        metadata
    )
    values (
        'MATERIAL_UPLOADED',
        auth.uid(),
        v_project_id,
        p_submission_id,
        jsonb_build_object(
            'material_id', v_material_id,
            'material_name', p_material_name,
            'quantity', p_quantity,
            'unit', p_unit
        )
    );

    return v_material_id;
end;
$$;
