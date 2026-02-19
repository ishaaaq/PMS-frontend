-- ============================================================
-- SQL MIGRATION: FIX CONSULTANT → CONTRACTOR VISIBILITY
-- Problem: Consultants cannot see contractor profiles due to
--          profiles RLS (self-read + admin only).
--          Adding a profiles RLS policy causes infinite recursion
--          because is_admin() → profiles → project_contractors → is_project_consultant() → project_consultants → is_admin() → ...
-- Solution: Use a SECURITY DEFINER RPC to bypass RLS entirely.
-- ============================================================

-- 1. DROP the recursive policy if it was already applied
drop policy if exists "consultant_view_project_contractors_profiles" on profiles;

-- 2. Create RPC to fetch project contractors with profile details
--    Accessible by consultants assigned to the project
create or replace function rpc_get_project_contractors(p_project_id uuid)
returns table (
    contractor_user_id uuid,
    full_name text,
    phone text,
    added_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
    -- Auth check: must be admin or project consultant
    if not is_admin() and not is_project_consultant(p_project_id) then
        raise exception 'Unauthorized';
    end if;

    return query
        select
            pc.contractor_user_id,
            p.full_name,
            p.phone,
            pc.added_at
        from project_contractors pc
        join profiles p on p.user_id = pc.contractor_user_id
        where pc.project_id = p_project_id;
end;
$$;
