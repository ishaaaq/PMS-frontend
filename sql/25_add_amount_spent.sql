-- ============================================================
-- ADD AMOUNT SPENT TO PROJECTS
-- ============================================================

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name='projects' AND column_name='amount_spent'
    ) THEN
        ALTER TABLE projects ADD COLUMN amount_spent numeric(18,2) DEFAULT 0;
    END IF;
END $$;
