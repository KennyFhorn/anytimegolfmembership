-- Anytime Golf — 20 fictional sample members, fully populated
-- Run in the Supabase SQL editor after 0010_seed_trackman_courses.sql.
--
-- Entirely made-up test data so you can see a populated roster and exercise
-- every tile (Members table, Standings, Calendar, History) against real
-- Supabase data instead of just the built-in demo mode — and, since these
-- 20 get registered + paid for whatever your next upcoming league night is,
-- so you can click "Generate groups" on that night and watch the
-- handicap-balanced snake-seed algorithm (lib/grouping.ts) actually run
-- against real rows. Handicaps below span ~3 to ~29 on purpose so the
-- grouping has real spread to balance.
--
-- None of these are real people or real logins (no auth.users row, no
-- profile_id) — they're roster/handicap rows only, the same way a coach
-- adds a walk-in member from the admin console. Every email uses the
-- reserved example.com domain, so they're trivial to find and remove later:
--
--   delete from members where email like '%@example.com';
--
-- (Their registrations/groups/scores cascade-delete automatically via the
-- foreign keys in 0001_init.sql.)

with new_members as (
  insert into members (
    first_name, last_name, full_name, email, phone, address, handicap_index,
    birthdate, gender, year_started_golf, emergency_contact_name, emergency_contact_phone, active
  )
  values
    ('Marcus', 'Bell', 'Marcus Bell', 'marcus.bell@example.com', '(614) 555-0142', '118 Fairway Ridge Dr, Columbus, OH', 6.4, '1987-03-14', 'male', 2004, 'Dana Bell', '(614) 555-0143', true),
    ('Priya', 'Anand', 'Priya Anand', 'priya.anand@example.com', '(312) 555-0118', '742 Lakeview Ave, Chicago, IL', 14.2, '1990-07-22', 'female', 2010, 'Raj Anand', '(312) 555-0119', true),
    ('Devon', 'Whitfield', 'Devon Whitfield', 'devon.whitfield@example.com', '(704) 555-0177', '29 Birchwood Ln, Charlotte, NC', 22.8, '1978-11-02', 'male', 1995, 'Carla Whitfield', '(704) 555-0178', true),
    ('Sarah', 'Kowalski', 'Sarah Kowalski', 'sarah.kowalski@example.com', '(215) 555-0163', '85 Elm Terrace, Philadelphia, PA', 9.1, '1995-01-30', 'female', 2012, 'Mike Kowalski', '(215) 555-0164', true),
    ('Trevor', 'Higgins', 'Trevor Higgins', 'trevor.higgins@example.com', '(503) 555-0129', '4410 Maple Grove Rd, Portland, OR', 18.5, '1983-05-18', 'male', 2001, 'Ellen Higgins', '(503) 555-0130', true),
    ('Nina', 'Alvarez', 'Nina Alvarez', 'nina.alvarez@example.com', '(602) 555-0187', '17 Desert Willow Ct, Phoenix, AZ', 4.7, '1992-09-09', 'female', 2006, 'Luis Alvarez', '(602) 555-0188', true),
    ('Jamal', 'Carter', 'Jamal Carter', 'jamal.carter@example.com', '(404) 555-0151', '963 Peachtree Cir, Atlanta, GA', 27.3, '1965-02-27', 'male', 1980, 'Renee Carter', '(404) 555-0152', true),
    ('Olivia', 'Reinholt', 'Olivia Reinholt', 'olivia.reinholt@example.com', '(612) 555-0144', '551 Northwood Dr, Minneapolis, MN', 12.0, '1998-12-05', 'female', 2015, 'Karl Reinholt', '(612) 555-0145', true),
    ('Casey', 'Doyle', 'Casey Doyle', 'casey.doyle@example.com', '(720) 555-0196', '88 Aspen Ridge Way, Denver, CO', 16.6, '1994-04-11', 'nonbinary', 2009, 'Jordan Doyle', '(720) 555-0197', true),
    ('Brendan', 'Mackey', 'Brendan Mackey', 'brendan.mackey@example.com', '(614) 555-0122', '203 Hawthorne St, Columbus, OH', 8.3, '1980-08-19', 'male', 1998, 'Susan Mackey', '(614) 555-0123', true),
    ('Yuki', 'Tanaka', 'Yuki Tanaka', 'yuki.tanaka@example.com', '(206) 555-0176', '77 Cedar Hollow Ave, Seattle, WA', 20.9, '1988-06-25', 'female', 2011, 'Kenji Tanaka', '(206) 555-0177', true),
    ('Reggie', 'Solomon', 'Reggie Solomon', 'reggie.solomon@example.com', '(210) 555-0138', '340 Rio Grande Blvd, San Antonio, TX', 3.2, '1975-10-08', 'male', 1990, 'Alicia Solomon', '(210) 555-0139', true),
    ('Hannah', 'Voss', 'Hannah Voss', 'hannah.voss@example.com', '(414) 555-0161', '12 Lakeshore Pkwy, Milwaukee, WI', 25.4, '2000-03-03', 'female', 2019, 'Greg Voss', '(414) 555-0162', true),
    ('Isaiah', 'Okafor', 'Isaiah Okafor', 'isaiah.okafor@example.com', '(713) 555-0184', '509 Bayou Bend Dr, Houston, TX', 11.7, '1985-01-16', 'male', 2003, 'Grace Okafor', '(713) 555-0185', true),
    ('Megan', 'Petrova', 'Megan Petrova', 'megan.petrova@example.com', '(303) 555-0111', '64 Foothills Rd, Boulder, CO', 17.9, '1993-07-07', 'female', 2008, 'Ivan Petrova', '(303) 555-0112', true),
    ('Colin', 'Ashby', 'Colin Ashby', 'colin.ashby@example.com', '(617) 555-0155', '221 Harborview St, Boston, MA', 5.5, '1970-09-28', 'male', 1985, 'Patricia Ashby', '(617) 555-0156', true),
    ('Renata', 'Silva', 'Renata Silva', 'renata.silva@example.com', '(305) 555-0169', '30 Palmetto Ave, Miami, FL', 29.1, '1996-11-20', 'female', 2021, 'Paulo Silva', '(305) 555-0170', true),
    ('Dmitri', 'Volkov', 'Dmitri Volkov', 'dmitri.volkov@example.com', '(212) 555-0193', '901 Riverside Dr, New York, NY', 13.4, '1982-02-14', 'male', 1999, 'Elena Volkov', '(212) 555-0194', true),
    ('Ava', 'Lindqvist', 'Ava Lindqvist', 'ava.lindqvist@example.com', '(612) 555-0128', '46 Sunset Bluff Ln, Minneapolis, MN', 7.8, '1991-05-05', 'female', 2007, 'Erik Lindqvist', '(612) 555-0129', true),
    ('Terrence', 'Boyd', 'Terrence Boyd', 'terrence.boyd@example.com', '(614) 555-0181', '15 Stonebridge Ct, Columbus, OH', 21.6, '1979-12-12', 'prefer_not_to_say', 1994, 'Monica Boyd', '(614) 555-0182', true)
  on conflict (email) do nothing
  returning id
),
target_night as (
  select id from league_nights where status = 'upcoming' order by date asc limit 1
)
insert into registrations (league_night_id, member_id, status, payment_status)
select
  target_night.id,
  new_members.id,
  'registered'::registration_status,
  (case when row_number() over () % 5 = 0 then 'pending' else 'paid' end)::payment_status
from new_members, target_night
on conflict (league_night_id, member_id) do nothing;
