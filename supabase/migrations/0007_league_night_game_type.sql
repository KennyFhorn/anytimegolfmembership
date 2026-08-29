-- Anytime Golf — round format ("Game Type") per league night
-- Run in the Supabase SQL editor after 0006_backfill_member_names.sql.
--
-- Free text rather than an enum on purpose: the list of formats (see
-- lib/game-types.ts) is a coach-facing convenience list that may grow over
-- time, and a text column avoids an ALTER TYPE migration every time it does.

alter table league_nights add column if not exists game_type text not null default 'stroke_play';
