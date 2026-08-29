// "member" is displayed as "User" in role-management UI — kept as "member"
// internally since it's already threaded through most of the codebase as a
// role check, and renaming it would touch far more than the role feature
// itself needs to.
export type UserRole = "owner" | "admin" | "member";

/** Owner and admin both get full Coach console access; owner additionally
 * gets the role-management radio buttons on the member edit page. Lives
 * here (not lib/auth.ts) so client components can import it too, without
 * pulling in lib/auth.ts's server-only (next/headers) dependencies. */
export function hasCoachAccess(role: UserRole | null | undefined): boolean {
  return role === "admin" || role === "owner";
}
export type DayOfWeek = "tuesday" | "thursday";
export type LeagueStatus = "upcoming" | "in_progress" | "completed";
export type RegistrationStatus = "registered" | "waitlisted" | "cancelled";
export type PaymentStatus = "pending" | "paid" | "refunded";

export interface Profile {
  id: string;
  role: UserRole;
  fullName: string;
}

export interface Member {
  id: string;
  profileId: string | null;
  fullName: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  phone: string | null;
  address: string | null;
  handicapIndex: number;
  active: boolean;
  birthdate: string | null;
  gender: string | null;
  yearStartedGolf: number | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
}

export interface Season {
  id: string;
  name: string;
  startDate: string;
  endDate: string | null;
  isActive: boolean;
}

export interface LeagueNight {
  id: string;
  seasonId: string | null;
  date: string;
  dayOfWeek: DayOfWeek;
  courseName: string;
  coursePar: number;
  capacity: number;
  signupFeeCents: number;
  status: LeagueStatus;
  /** Round format — see lib/game-types.ts. Free text so the coach isn't
   * blocked by a fixed enum; validated against GAME_TYPES in the UI. */
  gameType: string;
}

export interface Registration {
  id: string;
  leagueNightId: string;
  memberId: string;
  status: RegistrationStatus;
  paymentStatus: PaymentStatus;
  stripeCheckoutSessionId: string | null;
}

export interface Group {
  id: string;
  leagueNightId: string;
  groupNumber: number;
  avgHandicap: number | null;
  memberIds: string[];
}

export interface Score {
  id: string;
  leagueNightId: string;
  memberId: string;
  grossScore: number;
  netScore: number;
  points: number;
  position: number | null;
}

export interface Prize {
  id: string;
  leagueNightId: string | null;
  seasonId: string | null;
  title: string;
  place: number | null;
  winnerMemberId: string | null;
  notes: string | null;
}

export interface StandingRow {
  memberId: string;
  fullName: string;
  handicapIndex: number;
  roundsPlayed: number;
  wins: number;
  totalPoints: number;
  avgNetScore: number | null;
  rank: number;
}
