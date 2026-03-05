-- Add SUSPENDED to project_status enum
-- Note: ALTER TYPE ... ADD VALUE cannot be executed inside a transaction block in some older Postgres versions, 
-- but usually fine in standard scripts.

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t 
    JOIN pg_enum e ON t.oid = e.enumtypid 
    WHERE t.typname = 'project_status' AND e.enumlabel = 'SUSPENDED'
  ) THEN
    ALTER TYPE project_status ADD VALUE 'SUSPENDED';
  END IF;
END $$;
