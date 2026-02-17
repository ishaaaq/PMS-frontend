-- ============================================================
-- PROJECT MANAGEMENT AND OPERATIONS SYSTEM (MVP)
-- STAGE 3 – RPC IMPLEMENTATION
-- CONSOLIDATED FILE
-- ============================================================

-- IMPORTANT:
-- Ensure owner of these functions is a privileged role.
-- These rely on helper functions from RLS file.
-- SECURITY DEFINER is required.
-- ============================================================


-- ============================================================
-- RPC-03: CREATE PROJECT (WITH MILESTONES + BUDGET VALIDATION)
-- ============================================================

create or replace function rpc_create_project(payload jsonb)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
    v_project_id uuid;
    v_total_budget numeric;
    v_sum_budget numeric := 0;
    v_m jsonb;
begin
    if not is_admin() then
        raise exception 'Unauthorized';
    end if;

    v_total_budget := (payload->>'total_budget')::numeric;

    if v_total_budget < 0 then
        raise exception 'Project total budget must be non-negative';
    end if;

    insert into audit_logs (
    action,
    actor_user_id,
    project_id,
    metadata
)
values (
    'PROJECT_CREATED',
    auth.uid(),
    v_project_id,
    jsonb_build_object(
        'title', payload->>'title',
        'total_budget', v_total_budget
    )
);

    insert into projects (
        title,
        description,
        location,
        total_budget,
        currency,
        created_by_admin_id,
        status
    )
    values (
        payload->>'title',
        payload->>'description',
        payload->>'location',
        v_total_budget,
        coalesce(payload->>'currency','NGN'),
        auth.uid(),
        'ACTIVE'
    )
    returning id into v_project_id;

    for v_m in select * from jsonb_array_elements(payload->'milestones')
    loop
        if (v_m->>'budget')::numeric < 0 then
            raise exception 'Milestone budget must be non-negative';
        end if;

        v_sum_budget := v_sum_budget + (v_m->>'budget')::numeric;

        insert into milestones (
            project_id,
            title,
            description,
            sort_order,
            due_date,
            budget
        )
        values (
            v_project_id,
            v_m->>'title',
            v_m->>'description',
            (v_m->>'sort_order')::int,
            (v_m->>'due_date')::date,
            (v_m->>'budget')::numeric
        );
    end loop;

    if v_sum_budget > v_total_budget then
        raise exception 'Sum of milestone budgets exceeds project total budget';
    end if;

    return v_project_id;
end;
$$;


-- ============================================================
-- RPC-05: CREATE SECTION
-- ============================================================

create or replace function rpc_create_section(
    p_project_id uuid,
    p_name text,
    p_description text,
    p_milestone_ids uuid[]
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
    v_section_id uuid;
    v_mid uuid;
    v_project_check uuid;
begin
    if not is_project_consultant(p_project_id) then
        raise exception 'Unauthorized';
    end if;

    insert into sections (
        project_id,
        name,
        description,
        created_by_consultant_id
    )
    values (
        p_project_id,
        p_name,
        p_description,
        auth.uid()
    )
    returning id into v_section_id;

    foreach v_mid in array p_milestone_ids
    loop
        select project_id into v_project_check
        from milestones
        where id = v_mid;

        if v_project_check != p_project_id then
            raise exception 'Milestone does not belong to project';
        end if;

        insert into section_milestones(section_id, milestone_id)
        values (v_section_id, v_mid);
    end loop;

    return v_section_id;

    insert into audit_logs (
    action,
    actor_user_id,
    project_id,
    section_id,
    metadata
)
values (
    'SECTION_CREATED',
    auth.uid(),
    p_project_id,
    v_section_id,
    jsonb_build_object('name', p_name)
);

end;
$$;


-- ============================================================
-- RPC-07: ASSIGN CONTRACTOR TO SECTION
-- ============================================================

create or replace function rpc_assign_contractor_to_section(
    p_section_id uuid,
    p_contractor_user_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
    v_project_id uuid;
begin
    select project_id into v_project_id
    from sections
    where id = p_section_id;

    if not is_project_consultant(v_project_id) then
        raise exception 'Unauthorized';
    end if;

    insert into section_assignments(section_id, contractor_user_id)
    values (p_section_id, p_contractor_user_id)
    on conflict do nothing;

    insert into audit_logs (
    action,
    actor_user_id,
    project_id,
    section_id,
    metadata
)
values (
    'CONTRACTOR_ASSIGNED',
    auth.uid(),
    v_project_id,
    p_section_id,
    jsonb_build_object(
        'contractor_user_id', p_contractor_user_id
    )
);

end;
$$;


-- ============================================================
-- RPC-08: CREATE SUBMISSION (APPEND ONLY)
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
begin
    if not milestone_belongs_to_section_for_contractor(p_milestone_id) then
        raise exception 'Unauthorized';
    end if;

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

    update milestones
    set status = 'IN_PROGRESS'
    where id = p_milestone_id
    and status = 'NOT_STARTED';

    return v_submission_id;

    insert into audit_logs (
    action,
    actor_user_id,
    project_id,
    milestone_id,
    submission_id
)
values (
    'SUBMISSION_CREATED',
    auth.uid(),
    milestone_project_id(p_milestone_id),
    p_milestone_id,
    v_submission_id
);

end;
$$;


-- ============================================================
-- RPC-09: QUERY SUBMISSION
-- ============================================================

create or replace function rpc_query_submission(
    p_submission_id uuid,
    p_query_note text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
    v_project_id uuid;
begin
    select milestone_project_id(s.milestone_id)
    into v_project_id
    from submissions s
    where s.id = p_submission_id;

    if not is_project_consultant(v_project_id) then
        raise exception 'Unauthorized';
    end if;

    update submissions
    set status = 'QUERIED',
        query_note = p_query_note,
        reviewed_by_consultant_id = auth.uid(),
        reviewed_at = now()
    where id = p_submission_id;

    insert into audit_logs (
    action,
    actor_user_id,
    project_id,
    submission_id,
    metadata
)
values (
    'SUBMISSION_QUERIED',
    auth.uid(),
    v_project_id,
    p_submission_id,
    jsonb_build_object('note', p_query_note)
);

end;
$$;


-- ============================================================
-- RPC-10: APPROVE SUBMISSION
-- ============================================================

create or replace function rpc_approve_submission(
    p_submission_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
    v_milestone_id uuid;
    v_project_id uuid;
begin
    select milestone_id into v_milestone_id
    from submissions
    where id = p_submission_id;

    v_project_id := milestone_project_id(v_milestone_id);

    if not is_project_consultant(v_project_id) then
        raise exception 'Unauthorized';
    end if;

    update submissions
    set status = 'APPROVED',
        reviewed_by_consultant_id = auth.uid(),
        reviewed_at = now()
    where id = p_submission_id;

    update milestones
    set status = 'COMPLETED'
    where id = v_milestone_id;

    insert into audit_logs (
    action,
    actor_user_id,
    project_id,
    submission_id
)
values (
    'SUBMISSION_APPROVED',
    auth.uid(),
    v_project_id,
    p_submission_id
);

end;
$$;

-- ============================================================
-- RPC-01: CREATE INVITATION
-- ============================================================

create or replace function rpc_create_invitation(
    p_invitee_email text,
    p_role user_role,
    p_project_id uuid,
    p_section_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
    v_invitation_id uuid := uuid_generate_v4();
begin
    -- Admin can invite anyone
    if is_admin() then
        null;
    -- Consultant can invite contractor only
    elsif p_role = 'CONTRACTOR' and is_project_consultant(p_project_id) then
        null;
    else
        raise exception 'Unauthorized';
    end if;

    insert into invitations (
        id,
        invitee_email,
        role,
        project_id,
        section_id,
        status,
        created_by_user_id,
        created_at
    )
    values (
        v_invitation_id,
        p_invitee_email,
        p_role,
        p_project_id,
        p_section_id,
        'PENDING',
        auth.uid(),
        now()
    );

    return v_invitation_id;
end;
$$;


-- ============================================================
-- RPC-02: ACCEPT INVITATION
-- ============================================================

create or replace function rpc_accept_invitation(
    p_invitation_id uuid,
    p_full_name text,
    p_phone text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
    v_user_id uuid := auth.uid();
    v_role user_role;
begin
    select role into v_role
    from invitations
    where id = p_invitation_id
    and status = 'PENDING';

    if v_role is null then
        raise exception 'Invalid or expired invitation';
    end if;

    insert into profiles (
        user_id,
        role,
        full_name,
        phone
    )
    values (
        v_user_id,
        v_role,
        p_full_name,
        p_phone
    );

    update invitations
    set status = 'ACCEPTED'
    where id = p_invitation_id;

    return v_user_id;
end;
$$;


-- ============================================================
-- RPC-04: ASSIGN CONSULTANT TO PROJECT
-- ============================================================

create or replace function rpc_assign_consultant_to_project(
    p_project_id uuid,
    p_consultant_user_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
    if not is_admin() then
        raise exception 'Unauthorized';
    end if;

    insert into project_consultants(project_id, consultant_user_id)
    values (p_project_id, p_consultant_user_id)
    on conflict do nothing;

    insert into audit_logs (
    action,
    actor_user_id,
    project_id,
    metadata
)
values (
    'CONSULTANT_ASSIGNED',
    auth.uid(),
    p_project_id,
    jsonb_build_object(
        'consultant_user_id', p_consultant_user_id
    )
);

end;
$$;



-- ============================================================
-- RPC-11: SEND SECTION NOTIFICATION
-- ============================================================

create or replace function rpc_send_section_notification(
    p_section_id uuid,
    p_title text,
    p_message text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
    v_notification_id uuid := uuid_generate_v4();
    v_project_id uuid;
begin
    select project_id into v_project_id
    from sections
    where id = p_section_id;

    if not is_project_consultant(v_project_id) then
        raise exception 'Unauthorized';
    end if;

    insert into notifications (
        id,
        section_id,
        title,
        message,
        created_by_user_id
    )
    values (
        v_notification_id,
        p_section_id,
        p_title,
        p_message,
        auth.uid()
    );

    insert into notification_deliveries (
        notification_id,
        contractor_user_id
    )
    select v_notification_id, contractor_user_id
    from section_assignments
    where section_id = p_section_id;

    return v_notification_id;

    insert into audit_logs (
    action,
    actor_user_id,
    project_id,
    section_id
)
values (
    'NOTIFICATION_SENT',
    auth.uid(),
    v_project_id,
    p_section_id
);

end;
$$;


-- ============================================================
-- RPC-12: ADD PROJECT COMMENT
-- ============================================================

create or replace function rpc_add_project_comment(
    p_project_id uuid,
    p_body text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
    v_comment_id uuid := uuid_generate_v4();
begin
    if not (is_admin() or is_project_consultant(p_project_id)) then
        raise exception 'Unauthorized';
    end if;

    insert into project_comments (
        id,
        project_id,
        author_user_id,
        body
    )
    values (
        v_comment_id,
        p_project_id,
        auth.uid(),
        p_body
    );

    return v_comment_id;

    insert into audit_logs (
    action,
    actor_user_id,
    project_id
)
values (
    'PROJECT_COMMENT_ADDED',
    auth.uid(),
    p_project_id
);

end;
$$;

-- ============================================================
-- audit_logs RLS policies
-- ============================================================
alter table audit_logs enable row level security;

create policy "admin_read_audit"
on audit_logs for select
using (is_admin());

create policy "consultant_read_project_audit"
on audit_logs for select
using (
    project_id is not null
    and is_project_consultant(project_id)
);

create policy "audit_block_writes"
on audit_logs for all
using (false)
with check (false);
