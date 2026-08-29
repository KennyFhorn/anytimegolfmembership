-- Anytime Golf — backfill the courses table from existing league nights
-- Run in the Supabase SQL editor after 0008_courses.sql.
--
-- 0008 created the `courses` table empty; it only grows going forward, via
-- createLeagueNight's auto-insert on every new night. Any league night
-- created before 0008 existed never had its course name added, so the
-- Course autocomplete has nothing to suggest until this runs once.

insert into courses (name)
select distinct course_name from league_nights
on conflict (name) do nothing;
