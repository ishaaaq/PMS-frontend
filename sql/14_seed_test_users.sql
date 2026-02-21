-- ============================================================
-- FIX: Re-enable RLS with correct policy syntax
-- ============================================================

-- 1. Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 2. Drop old policies
DROP POLICY IF EXISTS "profiles_self_read" ON profiles;
DROP POLICY IF EXISTS "profiles_block_writes" ON profiles;
DROP POLICY IF EXISTS "profiles_block_updates" ON profiles;
DROP POLICY IF EXISTS "profiles_block_deletes" ON profiles;

-- 3. Self-read: authenticated users can read their own profile, admins read all
CREATE POLICY "profiles_self_read"
ON profiles FOR SELECT
USING (user_id = auth.uid() OR is_admin());

-- 4. Block direct writes — INSERT, UPDATE, DELETE separated with correct syntax
CREATE POLICY "profiles_block_inserts"
ON profiles FOR INSERT
WITH CHECK (false);

CREATE POLICY "profiles_block_updates"
ON profiles FOR UPDATE
USING (false)
WITH CHECK (false);

CREATE POLICY "profiles_block_deletes"
ON profiles FOR DELETE
USING (false);

-- 5. Upsert profiles (runs as postgres, bypasses RLS)
INSERT INTO profiles (user_id, role, full_name) VALUES
('25db755d-a4eb-4b35-bb7c-77d52d51675e', 'ADMIN', 'Test Admin'),
('f61610c9-cb77-4a1b-8a83-923d79d02d10', 'CONSULTANT', 'Test Consultant'),
('a1c56996-55eb-4f7a-b6cd-afd45b73ab55', 'CONTRACTOR', 'Test Contractor')
ON CONFLICT (user_id) DO UPDATE SET role = EXCLUDED.role, full_name = EXCLUDED.full_name;

-- 6. Verify
SELECT user_id, role, full_name FROM profiles WHERE user_id IN (
    '25db755d-a4eb-4b35-bb7c-77d52d51675e',
    'f61610c9-cb77-4a1b-8a83-923d79d02d10',
    'a1c56996-55eb-4f7a-b6cd-afd45b73ab55'
);
