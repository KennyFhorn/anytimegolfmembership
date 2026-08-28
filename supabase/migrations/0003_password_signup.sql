-- Anytime Golf — email/password self-signup + account recovery support
-- Run in the Supabase SQL editor after 0002_auth_linking.sql.
--
-- Also enable in the Supabase dashboard:
--   Authentication > Sign In / Providers > Email:
--     - Email provider: ON
--     - Confirm email: ON
--     - Allow new users to sign up: ON

-- ─────────────────────────────────────────────────────────────────────────
-- members: address, used only to verify identity on the "forgot email" flow
-- ─────────────────────────────────────────────────────────────────────────
alter table members add column if not exists address text;

-- ─────────────────────────────────────────────────────────────────────────
-- New auth user -> profile + member row.
-- Open self-signup: if no member matches the email, create one so the
-- player shows up in the league roster (the coach can edit details later).
-- ─────────────────────────────────────────────────────────────────────────
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  display_name text := coalesce(
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(new.raw_user_meta_data ->> 'name', ''),
    split_part(new.email, '@', 1)
  );
begin
  insert into public.profiles (id, role, full_name)
  values (new.id, 'member', display_name)
  on conflict (id) do nothing;

  insert into public.members (profile_id, full_name, email, phone)
  values (
    new.id,
    display_name,
    lower(new.email),
    nullif(new.raw_user_meta_data ->> 'phone', '')
  )
  on conflict (email) do update
    set profile_id = excluded.profile_id
    where public.members.profile_id is null;

  return new;
end;
$$;

-- ─────────────────────────────────────────────────────────────────────────
-- Backfill: give any existing auth user without a member row one
-- ─────────────────────────────────────────────────────────────────────────
insert into public.members (profile_id, full_name, email)
select
  u.id,
  coalesce(p.full_name, split_part(u.email, '@', 1)),
  lower(u.email)
from auth.users u
left join public.profiles p on p.id = u.id
left join public.members m on m.profile_id = u.id or lower(m.email) = lower(u.email)
where m.id is null
on conflict (email) do nothing;
