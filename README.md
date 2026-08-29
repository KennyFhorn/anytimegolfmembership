# Anytime Golf — League Night Management App

A league dashboard for Anytime Golf's indoor Trackman simulator studio: player registration and
payment, handicaps, weekly scores, standings, prizes/winners, and handicap-balanced foursomes for
Tuesday/Thursday league nights. Responsive for phones; the standings/dashboard views can be
AirPlayed or opened in a smart-TV browser for in-studio display.

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind CSS
- Supabase (Postgres + Auth + RLS) for data and login
- Stripe Checkout for league night signup fees
- Deployed on Vercel

## Running locally

```bash
npm install
npm run dev
```

The app runs on **http://localhost:8218** (see `package.json`).

### Demo mode (no setup required)

Without any environment variables set, the app runs entirely on an in-memory sample dataset
(~20 members, a completed night with scores/groups/prizes, an upcoming night open for
registration). Every page is fully click-through-able — admin console, member dashboard, and TV
displays — so you can see the whole app before connecting real services. A "Demo mode" badge
appears in the header whenever this is active. Demo data resets whenever the dev server restarts.

## Connecting real services

Copy `.env.example` to `.env.local` and fill in:

### 1. Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. In the SQL Editor, run the migrations in order: `supabase/migrations/0001_init.sql`,
   `0002_auth_linking.sql`, `0003_password_signup.sql`, `0004_member_profile_fields.sql`,
   `0005_member_self_service.sql`, `0006_backfill_member_names.sql`,
   `0007_league_night_game_type.sql`, `0008_courses.sql`, `0009_backfill_courses.sql`,
   `0010_seed_trackman_courses.sql`, `0011_seed_sample_members.sql` — these create all tables, RLS
   policies, the auth triggers, a starter "Fall 2026 League" season, the security-definer function
   members use to edit their own profile from `/account`, a one-time backfill of
   first_name/last_name for any member row created before 0004 added those columns, the
   `game_type` column league nights use for their round format (see `lib/game-types.ts`), the
   self-growing `courses` table used for the Course autocomplete on league night creation, a
   one-time backfill of that table from any league night created before 0008 added it, a
   ~556-course seed pulled from TrackMan's own published course list (source CSV in
   `supabase/source-data/`, formatted as "Course Name (City, State, Country)" — see the
   migration's header comment for the formatting rules), and 20 fictional sample members
   (`0011`, optional — see its header comment for how to remove them again) registered and paid
   for whatever your next upcoming league night is, so you can click "Generate groups" on it and
   see the handicap-balanced grouping actually run against real data.
3. Copy **Project Settings → API → Project URL / anon public key / service_role key** into
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`.
4. **Authentication → Sign In / Providers → Email**: enable the Email provider, "Confirm email",
   and "Allow new users to sign up". **Authentication → URL Configuration**: set the Site URL and
   add your deploy domain + `http://localhost:8218/**` to the redirect allow-list.
5. Create an account through `/signup` with the email you (or Coach Ryan) will use as admin, then
   in the SQL editor promote that user to admin:
   ```sql
   update profiles set role = 'admin'
   where id = (select id from auth.users where email = 'you@example.com');
   ```
6. Players self-register at `/signup`; the `handle_new_user` trigger creates their `profiles` and
   `members` rows and links them by email, so a member the coach pre-adds in `/admin/members` is
   auto-claimed when that person signs up with the same email.

### 2. Stripe

1. Grab test-mode keys from the [Stripe dashboard](https://dashboard.stripe.com/apikeys) →
   `STRIPE_SECRET_KEY`.
2. Add a webhook endpoint pointing at `https://<your-domain>/api/stripe/webhook` for the
   `checkout.session.completed` event, and put its signing secret in `STRIPE_WEBHOOK_SECRET`.
3. Without Stripe keys configured, the "Register & pay" flow still works end-to-end — it simulates
   an instant successful payment so you can test registration → payment → grouping without a real
   Stripe account.

### 3. Deploying to Vercel

Push this repo to GitHub and import it in Vercel, then set the same environment variables from
`.env.example` in the Vercel project settings. `npm run build` / `next start` don't hard-code the
port — the fixed `8218` port is only used by the local `npm run dev` / `npm start` scripts.

## App structure

- `/dashboard`, `/leagues/[id]`, `/standings` — member-facing, responsive (mobile-first)
- `/admin/*` — Coach Ryan's console: members, league nights, registrations/payments, group
  generation, score entry, prizes, seasons. Gated to `profiles.role = 'admin'`.
- `lib/grouping.ts` — snake-seed handicap balancing for foursomes
- `lib/handicap.ts` — rolling handicap recalculation after each night's scores are posted
- `lib/scoring.ts` — position → points and season standings aggregation
- `lib/data/` — repository interface with a Supabase-backed implementation and the in-memory demo
  implementation described above

## Known gaps / next steps

- Manual group edits are a two-player swap (select A, select B); no drag-and-drop yet.
- No email/SMS notifications.
- Member-to-auth-user linking is admin-managed via SQL for now (see step 5 above) — a self-serve
  "claim your profile" page would remove that manual step.
