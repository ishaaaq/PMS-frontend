-- Add missing columns to projects table that are needed by the frontend

ALTER TABLE projects
ADD COLUMN IF NOT EXISTS start_date date,
ADD COLUMN IF NOT EXISTS end_date date,
ADD COLUMN IF NOT EXISTS department text,
ADD COLUMN IF NOT EXISTS approved_budget numeric(18,2) check (approved_budget >= 0);

-- Provide some default values if necessary
-- Updates existing projects that might not have these yet
UPDATE projects SET end_date = CURRENT_DATE + interval '90 days' WHERE end_date IS NULL;
UPDATE projects SET start_date = created_at::date WHERE start_date IS NULL;
UPDATE projects SET approved_budget = total_budget WHERE approved_budget IS NULL;
