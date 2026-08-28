-- Anytime Golf League Night Management — initial schema
-- Run this in the Supabase SQL editor (or via `supabase db push`) on a fresh project.

create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────────────────────────────────────
-- Profiles: one row per auth.users, carries the app role
-- ─────────────────────────────────────────────────────────────────────────
create type user_role as enum ('admin', 'member');

create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role user_role not null default 'member',
  full_name text not null,
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────
-- Members: the golf-league identity (handicap, contact info)
-- ─────────────────────────────────────────────────────────────────────────
create table members (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles (id) on delete set null,
  full_name text not null,
  email text not null unique,
  phone text,
  handicap_index numeric(5, 1) not null default 18.0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────
-- Seasons: groups league nights for standings purposes
-- ─────────────────────────────────────────────────────────────────────────
create table seasons (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  start_date date not null,
  end_date date,
  is_active boolean not null default false,
  created_at timestamptz not null default now()
);

-- Only one active season at a time
create unique index one_active_season on seasons (is_active) where is_active;

-- ─────────────────────────────────────────────────────────────────────────
-- League nights: a single Tuesday/Thursday session
-- ─────────────────────────────────────────────────────────────────────────
create type league_status as enum ('upcoming', 'in_progress', 'completed');
create type day_of_week as enum ('tuesday', 'thursday');

create table league_nights (
  id uuid primary key default gen_random_uuid(),
  season_id uuid references seasons (id) on delete set null,
  date date not null,
  day_of_week day_of_week not null,
  course_name text not null,
  course_par integer not null default 72,
  capacity integer not null default 20,
  signup_fee_cents integer not null default 0,
  status league_status not null default 'upcoming',
  created_at timestamptz not null default now(),
  unique (date)
);

-- ─────────────────────────────────────────────────────────────────────────
-- Registrations: a member signing up (and paying) for a league night
-- ─────────────────────────────────────────────────────────────────────────
create type registration_status as enum ('registered', 'waitlisted', 'cancelled');
create type payment_status as enum ('pending', 'paid', 'refunded');

create table registrations (
  id uuid primary key default gen_random_uuid(),
  league_night_id uuid not null references league_nights (id) on delete cascade,
  member_id uuid not null references members (id) on delete cascade,
  status registration_status not null default 'registered',
  payment_status payment_status not null default 'pending',
  stripe_checkout_session_id text,
  created_at timestamptz not null default now(),
  unique (league_night_id, member_id)
);

-- ─────────────────────────────────────────────────────────────────────────
-- Groups: the balanced foursomes for a given night
-- ─────────────────────────────────────────────────────────────────────────
create table groups (
  id uuid primary key default gen_random_uuid(),
  league_night_id uuid not null references league_nights (id) on delete cascade,
  group_number integer not null,
  avg_handicap numeric(5, 1),
  created_at timestamptz not null default now(),
  unique (league_night_id, group_number)
);

create table group_members (
  group_id uuid not null references groups (id) on delete cascade,
  member_id uuid not null references members (id) on delete cascade,
  primary key (group_id, member_id)
);

-- ─────────────────────────────────────────────────────────────────────────
-- Scores: one row per member per league night
-- ─────────────────────────────────────────────────────────────────────────
create table scores (
  id uuid primary key default gen_random_uuid(),
  league_night_id uuid not null references league_nights (id) on delete cascade,
  member_id uuid not null references members (id) on delete cascade,
  gross_score integer not null,
  net_score numeric(5, 1) not null,
  points numeric(6, 1) not null default 0,
  position integer,
  created_at timestamptz not null default now(),
  unique (league_night_id, member_id)
);

-- ─────────────────────────────────────────────────────────────────────────
-- Prizes: nightly or season-level awards
-- ─────────────────────────────────────────────────────────────────────────
create table prizes (
  id uuid primary key default gen_random_uuid(),
  league_night_id uuid references league_nights (id) on delete cascade,
  season_id uuid references seasons (id) on delete cascade,
  title text not null,
  place integer,
  winner_member_id uuid references members (id) on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  constraint prize_has_one_scope check (
    (league_night_id is not null and season_id is null) or
    (league_night_id is null and season_id is not null)
  )
);

-- ─────────────────────────────────────────────────────────────────────────
-- Helper: is the current user an admin?
-- ─────────────────────────────────────────────────────────────────────────
create function is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- ─────────────────────────────────────────────────────────────────────────
-- Row Level Security
-- ─────────────────────────────────────────────────────────────────────────
alter table profiles enable row level security;
alter table members enable row level security;
alter table seasons enable row level security;
alter table league_nights enable row level security;
alter table registrations enable row level security;
alter table groups enable row level security;
alter table group_members enable row level security;
alter table scores enable row level security;
alter table prizes enable row level security;

-- profiles: users read/update their own row; admins read all
create policy "profiles_select_own_or_admin" on profiles
  for select using (id = auth.uid() or is_admin());
create policy "profiles_update_own" on profiles
  for update using (id = auth.uid());
create policy "profiles_admin_write" on profiles
  for insert with check (is_admin() or id = auth.uid());

-- members: public read (league is a small closed community; no PII beyond name/handicap
-- is exposed to the anon/TV client via the views used there), admin write
create policy "members_select_all" on members
  for select using (true);
create policy "members_admin_write" on members
  for insert with check (is_admin());
create policy "members_admin_update" on members
  for update using (is_admin());
create policy "members_admin_delete" on members
  for delete using (is_admin());

-- seasons / league_nights: public read, admin write
create policy "seasons_select_all" on seasons for select using (true);
create policy "seasons_admin_write" on seasons for insert with check (is_admin());
create policy "seasons_admin_update" on seasons for update using (is_admin());

create policy "league_nights_select_all" on league_nights for select using (true);
create policy "league_nights_admin_write" on league_nights for insert with check (is_admin());
create policy "league_nights_admin_update" on league_nights for update using (is_admin());

-- registrations: member can see/insert their own; admin sees/writes all
create policy "registrations_select_own_or_admin" on registrations
  for select using (
    is_admin() or member_id in (select id from members where profile_id = auth.uid())
  );
create policy "registrations_insert_own_or_admin" on registrations
  for insert with check (
    is_admin() or member_id in (select id from members where profile_id = auth.uid())
  );
create policy "registrations_update_admin" on registrations
  for update using (is_admin());

-- groups / group_members / scores / prizes: public read (TV + member views), admin write
create policy "groups_select_all" on groups for select using (true);
create policy "groups_admin_write" on groups for insert with check (is_admin());
create policy "groups_admin_update" on groups for update using (is_admin());
create policy "groups_admin_delete" on groups for delete using (is_admin());

create policy "group_members_select_all" on group_members for select using (true);
create policy "group_members_admin_write" on group_members for insert with check (is_admin());
create policy "group_members_admin_delete" on group_members for delete using (is_admin());

create policy "scores_select_all" on scores for select using (true);
create policy "scores_admin_write" on scores for insert with check (is_admin());
create policy "scores_admin_update" on scores for update using (is_admin());

create policy "prizes_select_all" on prizes for select using (true);
create policy "prizes_admin_write" on prizes for insert with check (is_admin());
create policy "prizes_admin_update" on prizes for update using (is_admin());

-- ─────────────────────────────────────────────────────────────────────────
-- Seed: first season, placeholder admin note
-- ─────────────────────────────────────────────────────────────────────────
insert into seasons (name, start_date, is_active)
values ('Fall 2026 League', current_date, true);

-- After creating your first Supabase Auth user (yourself / Coach Ryan), promote them to admin:
--   insert into profiles (id, role, full_name)
--   values ('<auth-user-uuid>', 'admin', 'Coach Ryan')
--   on conflict (id) do update set role = 'admin';
