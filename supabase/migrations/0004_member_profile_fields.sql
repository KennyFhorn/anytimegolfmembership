-- Anytime Golf — expanded membership profile fields
-- Run in the Supabase SQL editor after 0003_password_signup.sql.

-- ─────────────────────────────────────────────────────────────────────────
-- members: standard golf-simulator membership fields collected at signup
-- ─────────────────────────────────────────────────────────────────────────
alter table members add column if not exists first_name text;
alter table members add column if not exists last_name text;
alter table members add column if not exists birthdate date;
alter table members add column if not exists gender text;
alter table members add column if not exists year_started_golf integer;
alter table members add column if not exists emergency_contact_name text;
alter table members add column if not exists emergency_contact_phone text;

-- ─────────────────────────────────────────────────────────────────────────
-- New auth user -> profile + member row, now carrying the full signup form.
-- ─────────────────────────────────────────────────────────────────────────
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta_first_name text := nullif(new.raw_user_meta_data ->> 'first_name', '');
  meta_last_name text := nullif(new.raw_user_meta_data ->> 'last_name', '');
  display_name text := coalesce(
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(trim(concat_ws(' ', meta_first_name, meta_last_name)), ''),
    nullif(new.raw_user_meta_data ->> 'name', ''),
    split_part(new.email, '@', 1)
  );
begin
  insert into public.profiles (id, role, full_name)
  values (new.id, 'member', display_name)
  on conflict (id) do nothing;

  insert into public.members (
    profile_id, full_name, first_name, last_name, email, phone, address,
    handicap_index, birthdate, gender, year_started_golf,
    emergency_contact_name, emergency_contact_phone
  )
  values (
    new.id,
    display_name,
    meta_first_name,
    meta_last_name,
    lower(new.email),
    nullif(new.raw_user_meta_data ->> 'phone', ''),
    nullif(new.raw_user_meta_data ->> 'address', ''),
    coalesce((new.raw_user_meta_data ->> 'handicap_index')::numeric(5, 1), 18.0),
    nullif(new.raw_user_meta_data ->> 'birthdate', '')::date,
    nullif(new.raw_user_meta_data ->> 'gender', ''),
    nullif(new.raw_user_meta_data ->> 'year_started_golf', '')::integer,
    nullif(new.raw_user_meta_data ->> 'emergency_contact_name', ''),
    nullif(new.raw_user_meta_data ->> 'emergency_contact_phone', '')
  )
  on conflict (email) do update
    set profile_id = excluded.profile_id
    where public.members.profile_id is null;

  return new;
end;
$$;
