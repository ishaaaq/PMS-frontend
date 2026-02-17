create type audit_action as enum (
  'PROJECT_CREATED',
  'CONSULTANT_ASSIGNED',
  'SECTION_CREATED',
  'SECTION_UPDATED',
  'CONTRACTOR_ASSIGNED',
  'SUBMISSION_CREATED',
  'SUBMISSION_QUERIED',
  'SUBMISSION_APPROVED',
  'NOTIFICATION_SENT',
  'PROJECT_COMMENT_ADDED'
);

create table audit_logs (
    id uuid primary key default uuid_generate_v4(),

    action audit_action not null,

    actor_user_id uuid not null references profiles(user_id),

    project_id uuid references projects(id) on delete set null,
    section_id uuid references sections(id) on delete set null,
    milestone_id uuid references milestones(id) on delete set null,
    submission_id uuid references submissions(id) on delete set null,

    metadata jsonb,

    created_at timestamptz not null default now()
);

create index idx_audit_project on audit_logs(project_id);
create index idx_audit_section on audit_logs(section_id);
create index idx_audit_submission on audit_logs(submission_id);
create index idx_audit_actor on audit_logs(actor_user_id);
