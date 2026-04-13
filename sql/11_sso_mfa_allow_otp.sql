-- ============================================================
-- SQL MIGRATION: 11_sso_mfa_allow_otp.sql
-- ============================================================

-- Re-create the helper to also accept 'otp' since Supabase magic links generate 'otp' in AMR payload
CREATE OR REPLACE FUNCTION has_valid_session()
RETURNS boolean
LANGUAGE sql STABLE
AS $$
  SELECT auth.jwt() ->> 'aal' = 'aal2' 
      OR auth.jwt()->'amr' @> '[{"method": "magiclink"}]'::jsonb
      OR auth.jwt()->'amr' @> '[{"method": "sso"}]'::jsonb
      OR auth.jwt()->'amr' @> '[{"method": "otp"}]'::jsonb
      OR auth.jwt()->'amr' @> '[{"method": "recovery"}]'::jsonb;
$$;
