import { computeHandicapIndex } from "../handicap";
import { rankNightScores, computeStandings } from "../scoring";
import type {
  Group,
  LeagueNight,
  Member,
  PaymentStatus,
  Prize,
  Registration,
  Score,
  Season,
} from "../types";
import type {
  NewLeagueNightInput,
  NewMemberInput,
  NewPrizeInput,
  Repository,
  ScoreInput,
} from "./repository";

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

const FIRST_NAMES = [
  "Ryan", "Jordan", "Casey", "Morgan", "Taylor", "Alex", "Sam", "Drew",
  "Riley", "Cameron", "Jamie", "Avery", "Quinn", "Reese", "Blake", "Hayden",
  "Parker", "Rowan", "Skyler", "Emerson",
];
const LAST_NAMES = [
  "Mitchell", "Sullivan", "Reyes", "Chen", "Patel", "Nguyen", "Brooks",
  "Foster", "Coleman", "Ward", "Sanders", "Price", "Bell", "Hayes",
  "Reed", "Fox", "Hunt", "Lowe", "Pratt", "Vance",
];

const seasonId = "season_fall_2026";
const seasons: Season[] = [
  { id: seasonId, name: "Fall 2026 League", startDate: "2026-09-02", endDate: null, isActive: true },
];

const members: Member[] = FIRST_NAMES.map((first, i) => {
  const last = LAST_NAMES[i];
  return {
    id: `member_${i + 1}`,
    profileId: i === 0 ? "demo-admin-profile" : null,
    fullName: `${first} ${last}`,
    email: `${first.toLowerCase()}.${last.toLowerCase()}@example.com`,
    phone: null,
    handicapIndex: Math.round((4 + Math.random() * 20) * 10) / 10,
    active: true,
  };
});

const pastNightId = "night_past_1";
const nextNightId = "night_next_1";

const leagueNights: LeagueNight[] = [
  {
    id: pastNightId,
    seasonId,
    date: "2026-08-25",
    dayOfWeek: "tuesday",
    courseName: "Pebble Beach (TrackMan)",
    coursePar: 72,
    capacity: 20,
    signupFeeCents: 2500,
    status: "completed",
  },
  {
    id: nextNightId,
    seasonId,
    date: "2026-09-01",
    dayOfWeek: "tuesday",
    courseName: "St Andrews Old Course (TrackMan)",
    coursePar: 72,
    capacity: 20,
    signupFeeCents: 2500,
    status: "upcoming",
  },
];

const registrations: Registration[] = [
  ...members.map((m) => ({
    id: uid("reg"),
    leagueNightId: pastNightId,
    memberId: m.id,
    status: "registered" as const,
    paymentStatus: "paid" as const,
    stripeCheckoutSessionId: null,
  })),
  ...members.slice(0, 16).map((m) => ({
    id: uid("reg"),
    leagueNightId: nextNightId,
    memberId: m.id,
    status: "registered" as const,
    paymentStatus: (Math.random() > 0.3 ? "paid" : "pending") as PaymentStatus,
    stripeCheckoutSessionId: null,
  })),
];

const groups: Group[] = [];
{
  const sorted = [...members].sort((a, b) => a.handicapIndex - b.handicapIndex);
  const groupCount = Math.ceil(sorted.length / 4);
  const buckets: Member[][] = Array.from({ length: groupCount }, () => []);
  let idx = 0;
  let dir = 1;
  for (const m of sorted) {
    buckets[idx].push(m);
    if (idx + dir >= groupCount || idx + dir < 0) dir *= -1;
    else idx += dir;
  }
  buckets.forEach((bucket, i) => {
    groups.push({
      id: uid("group"),
      leagueNightId: pastNightId,
      groupNumber: i + 1,
      avgHandicap:
        Math.round((bucket.reduce((s, m) => s + m.handicapIndex, 0) / bucket.length) * 10) / 10,
      memberIds: bucket.map((m) => m.id),
    });
  });
}

const scores: Score[] = (() => {
  const raw = members.map((m) => ({
    memberId: m.id,
    netScore: Math.round((68 + Math.random() * 14) * 10) / 10,
  }));
  const ranked = rankNightScores(raw);
  return ranked.map((r) => ({
    id: uid("score"),
    leagueNightId: pastNightId,
    memberId: r.memberId,
    grossScore: Math.round(r.netScore + members.find((m) => m.id === r.memberId)!.handicapIndex),
    netScore: r.netScore,
    points: r.points,
    position: r.position,
  }));
})();

const prizes: Prize[] = [
  {
    id: uid("prize"),
    leagueNightId: pastNightId,
    seasonId: null,
    title: "Low Net",
    place: 1,
    winnerMemberId: scores.find((s) => s.position === 1)?.memberId ?? null,
    notes: null,
  },
  {
    id: uid("prize"),
    leagueNightId: null,
    seasonId,
    title: "Season Champion",
    place: 1,
    winnerMemberId: null,
    notes: "Awarded at end of season",
  },
];

export function createMockRepository(): Repository {
  return {
    async listMembers() {
      return [...members].sort((a, b) => a.fullName.localeCompare(b.fullName));
    },
    async getMember(id) {
      return members.find((m) => m.id === id) ?? null;
    },
    async getMemberByProfileId(profileId) {
      return members.find((m) => m.profileId === profileId) ?? null;
    },
    async createMember(input: NewMemberInput) {
      const member: Member = {
        id: uid("member"),
        profileId: null,
        fullName: input.fullName,
        email: input.email,
        phone: input.phone ?? null,
        handicapIndex: input.handicapIndex ?? 18,
        active: true,
      };
      members.push(member);
      return member;
    },
    async updateMember(id, input) {
      const member = members.find((m) => m.id === id);
      if (!member) throw new Error("Member not found");
      Object.assign(member, input);
      return member;
    },

    async listSeasons() {
      return [...seasons];
    },
    async getActiveSeason() {
      return seasons.find((s) => s.isActive) ?? null;
    },
    async createSeason(name, startDate) {
      const season: Season = { id: uid("season"), name, startDate, endDate: null, isActive: false };
      seasons.push(season);
      return season;
    },
    async setActiveSeason(id) {
      seasons.forEach((s) => (s.isActive = s.id === id));
    },

    async listLeagueNights() {
      return [...leagueNights].sort((a, b) => b.date.localeCompare(a.date));
    },
    async getLeagueNight(id) {
      return leagueNights.find((n) => n.id === id) ?? null;
    },
    async getNextLeagueNight() {
      return (
        [...leagueNights]
          .filter((n) => n.status === "upcoming")
          .sort((a, b) => a.date.localeCompare(b.date))[0] ?? null
      );
    },
    async createLeagueNight(input: NewLeagueNightInput) {
      const night: LeagueNight = { id: uid("night"), status: "upcoming", ...input };
      leagueNights.push(night);
      return night;
    },
    async setLeagueNightStatus(id, status) {
      const night = leagueNights.find((n) => n.id === id);
      if (night) night.status = status;
    },

    async listRegistrations(leagueNightId) {
      return registrations.filter((r) => r.leagueNightId === leagueNightId);
    },
    async getRegistration(leagueNightId, memberId) {
      return (
        registrations.find((r) => r.leagueNightId === leagueNightId && r.memberId === memberId) ??
        null
      );
    },
    async registerMember(leagueNightId, memberId) {
      const existing = registrations.find(
        (r) => r.leagueNightId === leagueNightId && r.memberId === memberId,
      );
      if (existing) return existing;
      const registration: Registration = {
        id: uid("reg"),
        leagueNightId,
        memberId,
        status: "registered",
        paymentStatus: "pending",
        stripeCheckoutSessionId: null,
      };
      registrations.push(registration);
      return registration;
    },
    async setPaymentStatus(registrationId, status) {
      const reg = registrations.find((r) => r.id === registrationId);
      if (reg) reg.paymentStatus = status;
    },

    async listGroups(leagueNightId) {
      return groups.filter((g) => g.leagueNightId === leagueNightId);
    },
    async saveGroups(leagueNightId, newGroups) {
      for (let i = groups.length - 1; i >= 0; i--) {
        if (groups[i].leagueNightId === leagueNightId) groups.splice(i, 1);
      }
      const saved = newGroups.map((g) => ({
        id: uid("group"),
        leagueNightId,
        groupNumber: g.groupNumber,
        avgHandicap: g.avgHandicap,
        memberIds: g.memberIds,
      }));
      groups.push(...saved);
      return saved;
    },

    async listScores(leagueNightId) {
      return scores.filter((s) => s.leagueNightId === leagueNightId);
    },
    async listScoresForSeason() {
      // Demo mode has a single season; return every recorded score.
      return [...scores];
    },
    async saveScores(leagueNightId, input: ScoreInput[]) {
      const night = leagueNights.find((n) => n.id === leagueNightId);
      const par = night?.coursePar ?? 72;

      const withNet = input.map((s) => ({
        memberId: s.memberId,
        grossScore: s.grossScore,
        netScore:
          Math.round(
            (s.grossScore - (members.find((m) => m.id === s.memberId)?.handicapIndex ?? 0)) * 10,
          ) / 10,
      }));
      const ranked = rankNightScores(withNet);

      for (let i = scores.length - 1; i >= 0; i--) {
        if (scores[i].leagueNightId === leagueNightId) scores.splice(i, 1);
      }
      const saved: Score[] = ranked.map((r) => {
        const original = withNet.find((w) => w.memberId === r.memberId)!;
        return {
          id: uid("score"),
          leagueNightId,
          memberId: r.memberId,
          grossScore: original.grossScore,
          netScore: r.netScore,
          points: r.points,
          position: r.position,
        };
      });
      scores.push(...saved);

      // Recompute rolling handicap for each participant from their score history.
      for (const s of saved) {
        const member = members.find((m) => m.id === s.memberId);
        if (!member) continue;
        const history = scores
          .filter((sc) => sc.memberId === member.id)
          .map((sc) => {
            const n = leagueNights.find((ln) => ln.id === sc.leagueNightId);
            return { grossScore: sc.grossScore, coursePar: n?.coursePar ?? par, playedAt: n?.date ?? "" };
          });
        member.handicapIndex = computeHandicapIndex(history);
      }

      if (night) night.status = "completed";
      return saved;
    },
    async getStandings(seasonId) {
      const seasonNightIds = leagueNights.filter((n) => n.seasonId === seasonId).map((n) => n.id);
      const seasonScores = scores.filter((s) => seasonNightIds.includes(s.leagueNightId));
      return computeStandings(members, seasonScores);
    },

    async listPrizes() {
      return [...prizes];
    },
    async createPrize(input: NewPrizeInput) {
      const prize: Prize = { id: uid("prize"), notes: null, ...input };
      prizes.push(prize);
      return prize;
    },
  };
}
