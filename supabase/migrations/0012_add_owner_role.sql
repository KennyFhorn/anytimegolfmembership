-- Anytime Golf — add 'owner' to the user_role enum
-- Run in the Supabase SQL editor after 0011_seed_sample_members.sql, as its
-- own step. Postgres won't let a new enum value be used in the same
-- transaction that added it, so this is deliberately just the enum change —
-- nothing here references 'owner' yet. Run 0013 right after this one.

alter type user_role add value if not exists 'owner';
