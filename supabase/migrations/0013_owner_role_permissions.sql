-- Anytime Golf — owner-role permissions and role-management RPC
-- Run in the Supabase SQL editor after 0012_add_owner_role.sql.

-- is_admin() gates every existing admin-only RLS policy (members, league
-- nights, groups, scores, prizes, seasons). Owner needs everything admin
-- has, so it satisfies this check too.
create or replace function is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role in ('admin', 'owner')
  );
$$;

-- The only way profiles.role can change from here on: a narrow,
-- security-definer function callable only by an existing admin/owner,
-- rather than a general "update your own profile" policy. See below for
-- why that matters.
create or replace function update_member_role(target_profile_id uuid, new_role user_role)
returns profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  caller_role user_role;
  updated profiles;
begin
  select role into caller_role from profiles where id = auth.uid();
  if caller_role is null or caller_role not in ('admin', 'owner') then
    raise exception 'Only admins or owners can change a member''s role';
  end if;

  update profiles set role = new_role where id = target_profile_id
  returning * into updated;

  if updated.id is null then
    raise exception 'No profile found for that account';
  end if;

  return updated;
end;
$$;

grant execute on function update_member_role(uuid, user_role) to authenticated;

-- profiles_update_own (from 0001_init.sql) let a signed-in member update
-- ANY column on their own profiles row via a direct REST call — RLS only
-- restricts which ROW you can touch, not which columns, and nothing in the
-- app actually used this policy (profile display-name edits go through
-- members.full_name via /account's update_own_member_profile RPC, not
-- profiles). That combination meant a member could already self-promote by
-- crafting `PATCH /profiles?id=eq.<self>` with `{"role":"admin"}` — this
-- closes that hole. Role changes now only ever happen through
-- update_member_role() above (or the one-time manual SQL promotion
-- documented in the README for bootstrapping your very first admin).
drop policy if exists "profiles_update_own" on profiles;
