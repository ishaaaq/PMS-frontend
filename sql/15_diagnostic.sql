-- ============================================================
-- DIAGNOSTIC: Run this in the Supabase SQL Editor (Role: postgres)
-- Checks why is_admin() returns false for the admin user
-- ============================================================

-- 1. Check the admin profile row (is_active must be true)
SELECT user_id, role, full_name, is_active
FROM profiles
WHERE user_id = '25db755d-a4eb-4b35-bb7c-77d52d51675e';

-- 2. Check current RLS policies on the profiles table
SELECT policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'profiles';

-- 3. Check current RLS policies on the projects table
SELECT policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'projects';

-- 4. Check if the is_admin function exists and what it contains
SELECT pg_get_functiondef(oid) 
FROM pg_proc 
WHERE proname = 'is_admin';

-- 5. Test is_admin() directly as the admin user
-- (This runs as postgres so auth.uid() returns NULL — we simulate it)
SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = '25db755d-a4eb-4b35-bb7c-77d52d51675e'
    AND role = 'ADMIN'
    AND is_active = true
) AS should_be_admin;

-- 6. Check how many projects exist
SELECT count(*) AS project_count FROM projects;

-- 7. Ensure is_active is true for admin
UPDATE profiles 
SET is_active = true 
WHERE user_id = '25db755d-a4eb-4b35-bb7c-77d52d51675e';
