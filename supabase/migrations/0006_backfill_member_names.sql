-- Anytime Golf — backfill first_name/last_name for members created before
-- migration 0004 added those columns (they only had full_name until then).
-- Run in the Supabase SQL editor after 0005_member_self_service.sql.

update public.members
set
  first_name = coalesce(first_name, nullif(split_part(full_name, ' ', 1), '')),
  last_name = coalesce(
    last_name,
    nullif(trim(substring(full_name from length(split_part(full_name, ' ', 1)) + 1)), '')
  )
where full_name is not null
  and (first_name is null or last_name is null);
