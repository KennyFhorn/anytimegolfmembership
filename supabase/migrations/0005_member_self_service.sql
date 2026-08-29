-- Anytime Golf — member self-service profile updates
-- Run in the Supabase SQL editor after 0004_member_profile_fields.sql.
--
-- Members can already SELECT their own row (members_select_all is public
-- read), but there is no UPDATE policy for the "member" role — only
-- members_admin_update. Rather than adding a broad self-update RLS policy
-- (which would let a member's own REST call touch ANY column, including
-- handicap_index and active), this exposes a narrow security-definer
-- function that only ever writes the columns a member is allowed to
-- self-manage, and only ever to the row matching their own auth.uid().

create or replace function update_own_member_profile(
  p_first_name text,
  p_last_name text,
  p_phone text,
  p_address text,
  p_birthdate date,
  p_gender text,
  p_year_started_golf integer,
  p_emergency_contact_name text,
  p_emergency_contact_phone text
)
returns members
language plpgsql
security definer
set search_path = public
as $$
declare
  updated members;
begin
  update public.members
  set
    first_name = p_first_name,
    last_name = p_last_name,
    full_name = trim(concat_ws(' ', p_first_name, p_last_name)),
    phone = p_phone,
    address = p_address,
    birthdate = p_birthdate,
    gender = p_gender,
    year_started_golf = p_year_started_golf,
    emergency_contact_name = p_emergency_contact_name,
    emergency_contact_phone = p_emergency_contact_phone
  where profile_id = auth.uid()
  returning * into updated;

  if updated.id is null then
    raise exception 'No member record linked to this account';
  end if;

  return updated;
end;
$$;

grant execute on function update_own_member_profile(
  text, text, text, text, date, text, integer, text, text
) to authenticated;
