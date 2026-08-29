-- Anytime Golf — reusable course-name library for league night creation
-- Run in the Supabase SQL editor after 0007_league_night_game_type.sql.
--
-- There's no reliable, current catalog of TrackMan's actual licensed course
-- library to hardcode here (it's specific to Anytime Golf's own
-- subscription tier and changes over time). Instead, this table starts
-- empty and grows automatically — every time a league night is created with
-- a course name that isn't already in it, it gets added (see
-- createLeagueNight in lib/data/supabase.ts) — so it becomes an accurate,
-- self-maintaining dropdown of exactly the courses this studio actually
-- uses, typed once from whatever TrackMan itself calls them.

create table courses (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

alter table courses enable row level security;

create policy "courses_select_all" on courses for select using (true);
create policy "courses_admin_write" on courses for insert with check (is_admin());
