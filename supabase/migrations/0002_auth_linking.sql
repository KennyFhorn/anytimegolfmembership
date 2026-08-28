-- Anytime Golf — auth linking
-- Auto-provision a `profiles` row for every new auth user, and keep
-- `members.profile_id` linked to the matching auth user by email so a
-- player's magic-link login connects to the member record the coach created.
-- Run this in the Supabase SQL editor after 0001_init.sql.

-- ─────────────────────────────────────────────────────────────────────────
-- New auth user -> profiles row (+ link any member with the same email)
-- ─────────────────────────────────────────────────────────────────────────
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role, full_name)
  values (
    new.id,
    'member',
    coalesce(
      nullif(new.raw_user_meta_data ->> 'full_name', ''),
      nullif(new.raw_user_meta_data ->> 'name', ''),
      split_part(new.email, '@', 1)
    )
  )
  on conflict (id) do nothing;

  update public.members
  set profile_id = new.id
  where lower(email) = lower(new.email)
    and profile_id is null;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ─────────────────────────────────────────────────────────────────────────
-- New/updated member -> link to an existing auth user with the same email
-- (covers the case where the player signed up before the coach added them)
-- ─────────────────────────────────────────────────────────────────────────
create or replace function link_member_to_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  matched_id uuid;
begin
  if new.profile_id is not null then
    return new;
  end if;

  select id into matched_id
  from auth.users
  where lower(email) = lower(new.email)
  limit 1;

  if matched_id is not null then
    new.profile_id := matched_id;
    insert into public.profiles (id, role, full_name)
    values (matched_id, 'member', new.full_name)
    on conflict (id) do nothing;
  end if;

  return new;
end;
$$;

drop trigger if exists on_member_upsert_link_profile on members;
create trigger on_member_upsert_link_profile
  before insert or update of email on members
  for each row execute function link_member_to_profile();

-- ─────────────────────────────────────────────────────────────────────────
-- Backfill: link any members already matching an existing auth user
-- ─────────────────────────────────────────────────────────────────────────
update public.members m
set profile_id = u.id
from auth.users u
where lower(m.email) = lower(u.email)
  and m.profile_id is null;

insert into public.profiles (id, role, full_name)
select u.id, 'member', split_part(u.email, '@', 1)
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null
on conflict (id) do nothing;
