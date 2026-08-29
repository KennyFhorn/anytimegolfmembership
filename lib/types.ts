export type UserRole = "admin" | "member";
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
