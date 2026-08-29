import type {
  Group,
  LeagueNight,
  Member,
  PaymentStatus,
  Prize,
  Registration,
  Score,
  Season,
  StandingRow,
} from "../types";

export interface NewMemberInput {
  fullName: string;
  firstName?: string | null;
  lastName?: string | null;
  email: string;
  phone?: string | null;
  address?: string | null;
  handicapIndex?: number;
  birthdate?: string | null;
  gender?: string | null;
  yearStartedGolf?: number | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
}

export interface NewLeagueNightInput {
  seasonId: string | null;
  date: string;
  dayOfWeek: "tuesday" | "thursday";
  courseName: string;
  coursePar: number;
  capacity: number;
  signupFeeCents: number;
}

export interface ScoreInput {
  memberId: string;
  grossScore: number;
}

export interface NewPrizeInput {
  leagueNightId: string | null;
  seasonId: string | null;
  title: string;
  place: number | null;
  winnerMemberId: string | null;
  notes?: string | null;
}

/** Fields a member may edit about themselves — deliberately excludes
 * handicap, active status, and email, which stay coach/system-managed. */
export interface OwnMemberProfileInput {
  firstName: string;
  lastName: string;
  phone?: string | null;
  address?: string | null;
  birthdate?: string | null;
  gender?: string | null;
  yearStartedGolf?: number | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
}

/**
 * Data access boundary for the whole app. Two implementations satisfy this
 * interface — a real Supabase-backed one and an in-memory demo one — chosen
 * automatically by `getRepository()` depending on whether Supabase env vars
 * are present. Every page/route imports `getRepository()`, never a concrete
 * implementation directly.
 */
export interface Repository {
  // Members
  listMembers(): Promise<Member[]>;
  getMember(id: string): Promise<Member | null>;
  getMemberByProfileId(profileId: string): Promise<Member | null>;
  createMember(input: NewMemberInput): Promise<Member>;
  updateMember(id: string, input: Partial<NewMemberInput> & { active?: boolean }): Promise<Member>;
  /** Self-service update, scoped to the member with this id — callers must
   * already have verified `id` belongs to the requesting user. */
  updateOwnMember(id: string, input: OwnMemberProfileInput): Promise<Member>;

  // Seasons
  listSeasons(): Promise<Season[]>;
  getActiveSeason(): Promise<Season | null>;
  createSeason(name: string, startDate: string): Promise<Season>;
  setActiveSeason(id: string): Promise<void>;

  // League nights
  listLeagueNights(): Promise<LeagueNight[]>;
  getLeagueNight(id: string): Promise<LeagueNight | null>;
  getNextLeagueNight(): Promise<LeagueNight | null>;
  createLeagueNight(input: NewLeagueNightInput): Promise<LeagueNight>;
  setLeagueNightStatus(id: string, status: LeagueNight["status"]): Promise<void>;

  // Registrations
  listRegistrations(leagueNightId: string): Promise<Registration[]>;
  getRegistration(leagueNightId: string, memberId: string): Promise<Registration | null>;
  registerMember(leagueNightId: string, memberId: string): Promise<Registration>;
  setPaymentStatus(registrationId: string, status: PaymentStatus): Promise<void>;

  // Groups
  listGroups(leagueNightId: string): Promise<Group[]>;
  saveGroups(
    leagueNightId: string,
    groups: { groupNumber: number; avgHandicap: number; memberIds: string[] }[],
  ): Promise<Group[]>;

  // Scores
  listScores(leagueNightId: string): Promise<Score[]>;
  listScoresForSeason(seasonId: string): Promise<Score[]>;
  saveScores(leagueNightId: string, scores: ScoreInput[]): Promise<Score[]>;
  getStandings(seasonId: string): Promise<StandingRow[]>;

  // Prizes
  listPrizes(): Promise<Prize[]>;
  createPrize(input: NewPrizeInput): Promise<Prize>;
}
