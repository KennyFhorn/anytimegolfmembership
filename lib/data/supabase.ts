import type { SupabaseClient } from "@supabase/supabase-js";
import { computeHandicapIndex } from "../handicap";
import { computeStandings, rankNightScores } from "../scoring";
import type { Group, LeagueNight, Member, Prize, Registration, Score, Season } from "../types";
import type {
  NewLeagueNightInput,
  NewMemberInput,
  NewPrizeInput,
  Repository,
  ScoreInput,
} from "./repository";

type Row = Record<string, unknown>;

function toMember(row: Row): Member {
  return {
    id: row.id as string,
    profileId: row.profile_id as string | null,
    fullName: row.full_name as string,
    firstName: (row.first_name as string | null) ?? null,
    lastName: (row.last_name as string | null) ?? null,
    email: row.email as string,
    phone: row.phone as string | null,
    address: (row.address as string | null) ?? null,
    handicapIndex: Number(row.handicap_index),
    active: row.active as boolean,
    birthdate: (row.birthdate as string | null) ?? null,
    gender: (row.gender as string | null) ?? null,
    yearStartedGolf: row.year_started_golf === null || row.year_started_golf === undefined
      ? null
      : Number(row.year_started_golf),
    emergencyContactName: (row.emergency_contact_name as string | null) ?? null,
    emergencyContactPhone: (row.emergency_contact_phone as string | null) ?? null,
  };
}

function toSeason(row: Row): Season {
  return {
    id: row.id as string,
    name: row.name as string,
    startDate: row.start_date as string,
    endDate: row.end_date as string | null,
    isActive: row.is_active as boolean,
  };
}

function toLeagueNight(row: Row): LeagueNight {
  return {
    id: row.id as string,
    seasonId: row.season_id as string | null,
    date: row.date as string,
    dayOfWeek: row.day_of_week as LeagueNight["dayOfWeek"],
    courseName: row.course_name as string,
    coursePar: row.course_par as number,
    capacity: row.capacity as number,
    signupFeeCents: row.signup_fee_cents as number,
    status: row.status as LeagueNight["status"],
  };
}

function toRegistration(row: Row): Registration {
  return {
    id: row.id as string,
    leagueNightId: row.league_night_id as string,
    memberId: row.member_id as string,
    status: row.status as Registration["status"],
    paymentStatus: row.payment_status as Registration["paymentStatus"],
    stripeCheckoutSessionId: row.stripe_checkout_session_id as string | null,
  };
}

function toScore(row: Row): Score {
  return {
    id: row.id as string,
    leagueNightId: row.league_night_id as string,
    memberId: row.member_id as string,
    grossScore: row.gross_score as number,
    netScore: Number(row.net_score),
    points: Number(row.points),
    position: row.position as number | null,
  };
}

function toPrize(row: Row): Prize {
  return {
    id: row.id as string,
    leagueNightId: row.league_night_id as string | null,
    seasonId: row.season_id as string | null,
    title: row.title as string,
    place: row.place as number | null,
    winnerMemberId: row.winner_member_id as string | null,
    notes: row.notes as string | null,
  };
}

function must<T>(value: T | null | undefined, message: string): T {
  if (value === null || value === undefined) throw new Error(message);
  return value;
}

export function createSupabaseRepository(client: SupabaseClient): Repository {
  return {
    async listMembers() {
      const { data, error } = await client.from("members").select("*").order("full_name");
      if (error) throw error;
      return (data ?? []).map(toMember);
    },
    async getMember(id) {
      const { data } = await client.from("members").select("*").eq("id", id).maybeSingle();
      return data ? toMember(data) : null;
    },
    async getMemberByProfileId(profileId) {
      const { data } = await client
        .from("members")
        .select("*")
        .eq("profile_id", profileId)
        .maybeSingle();
      return data ? toMember(data) : null;
    },
    async createMember(input: NewMemberInput) {
      const { data, error } = await client
        .from("members")
        .insert({
          full_name: input.fullName,
          first_name: input.firstName ?? null,
          last_name: input.lastName ?? null,
          email: input.email,
          phone: input.phone ?? null,
          address: input.address ?? null,
          handicap_index: input.handicapIndex ?? 18,
          birthdate: input.birthdate ?? null,
          gender: input.gender ?? null,
          year_started_golf: input.yearStartedGolf ?? null,
          emergency_contact_name: input.emergencyContactName ?? null,
          emergency_contact_phone: input.emergencyContactPhone ?? null,
        })
        .select()
        .single();
      if (error) throw error;
      return toMember(data);
    },
    async updateMember(id, input) {
      const patch: Record<string, unknown> = {};
      if (input.fullName !== undefined) patch.full_name = input.fullName;
      if (input.firstName !== undefined) patch.first_name = input.firstName;
      if (input.lastName !== undefined) patch.last_name = input.lastName;
      if (input.email !== undefined) patch.email = input.email;
      if (input.phone !== undefined) patch.phone = input.phone;
      if (input.address !== undefined) patch.address = input.address;
      if (input.handicapIndex !== undefined) patch.handicap_index = input.handicapIndex;
      if (input.active !== undefined) patch.active = input.active;
      if (input.birthdate !== undefined) patch.birthdate = input.birthdate;
      if (input.gender !== undefined) patch.gender = input.gender;
      if (input.yearStartedGolf !== undefined) patch.year_started_golf = input.yearStartedGolf;
      if (input.emergencyContactName !== undefined) patch.emergency_contact_name = input.emergencyContactName;
      if (input.emergencyContactPhone !== undefined) patch.emergency_contact_phone = input.emergencyContactPhone;

      const { data, error } = await client
        .from("members")
        .update(patch)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return toMember(data);
    },

    async listSeasons() {
      const { data, error } = await client.from("seasons").select("*").order("start_date", { ascending: false });
      if (error) throw error;
      return (data ?? []).map(toSeason);
    },
    async getActiveSeason() {
      const { data } = await client.from("seasons").select("*").eq("is_active", true).maybeSingle();
      return data ? toSeason(data) : null;
    },
    async createSeason(name, startDate) {
      const { data, error } = await client
        .from("seasons")
        .insert({ name, start_date: startDate })
        .select()
        .single();
      if (error) throw error;
      return toSeason(data);
    },
    async setActiveSeason(id) {
      await client.from("seasons").update({ is_active: false }).neq("id", id);
      const { error } = await client.from("seasons").update({ is_active: true }).eq("id", id);
      if (error) throw error;
    },

    async listLeagueNights() {
      const { data, error } = await client.from("league_nights").select("*").order("date", { ascending: false });
      if (error) throw error;
      return (data ?? []).map(toLeagueNight);
    },
    async getLeagueNight(id) {
      const { data } = await client.from("league_nights").select("*").eq("id", id).maybeSingle();
      return data ? toLeagueNight(data) : null;
    },
    async getNextLeagueNight() {
      const { data } = await client
        .from("league_nights")
        .select("*")
        .eq("status", "upcoming")
        .order("date", { ascending: true })
        .limit(1)
        .maybeSingle();
      return data ? toLeagueNight(data) : null;
    },
    async createLeagueNight(input: NewLeagueNightInput) {
      const { data, error } = await client
        .from("league_nights")
        .insert({
          season_id: input.seasonId,
          date: input.date,
          day_of_week: input.dayOfWeek,
          course_name: input.courseName,
          course_par: input.coursePar,
          capacity: input.capacity,
          signup_fee_cents: input.signupFeeCents,
        })
        .select()
        .single();
      if (error) throw error;
      return toLeagueNight(data);
    },
    async setLeagueNightStatus(id, status) {
      const { error } = await client.from("league_nights").update({ status }).eq("id", id);
      if (error) throw error;
    },

    async listRegistrations(leagueNightId) {
      const { data, error } = await client
        .from("registrations")
        .select("*")
        .eq("league_night_id", leagueNightId);
      if (error) throw error;
      return (data ?? []).map(toRegistration);
    },
    async getRegistration(leagueNightId, memberId) {
      const { data } = await client
        .from("registrations")
        .select("*")
        .eq("league_night_id", leagueNightId)
        .eq("member_id", memberId)
        .maybeSingle();
      return data ? toRegistration(data) : null;
    },
    async registerMember(leagueNightId, memberId) {
      const { data, error } = await client
        .from("registrations")
        .upsert(
          { league_night_id: leagueNightId, member_id: memberId },
          { onConflict: "league_night_id,member_id" },
        )
        .select()
        .single();
      if (error) throw error;
      return toRegistration(data);
    },
    async setPaymentStatus(registrationId, status) {
      const { error } = await client
        .from("registrations")
        .update({ payment_status: status })
        .eq("id", registrationId);
      if (error) throw error;
    },

    async listGroups(leagueNightId) {
      const { data, error } = await client
        .from("groups")
        .select("*, group_members(member_id)")
        .eq("league_night_id", leagueNightId)
        .order("group_number");
      if (error) throw error;
      return (data ?? []).map((row: Row): Group => {
        const groupMembers = (row.group_members ?? []) as { member_id: string }[];
        return {
          id: row.id as string,
          leagueNightId: row.league_night_id as string,
          groupNumber: row.group_number as number,
          avgHandicap: row.avg_handicap === null ? null : Number(row.avg_handicap),
          memberIds: groupMembers.map((gm) => gm.member_id),
        };
      });
    },
    async saveGroups(leagueNightId, newGroups) {
      const { data: existing } = await client
        .from("groups")
        .select("id")
        .eq("league_night_id", leagueNightId);
      const existingIds = (existing ?? []).map((g: Row) => g.id as string);
      if (existingIds.length > 0) {
        await client.from("group_members").delete().in("group_id", existingIds);
        await client.from("groups").delete().in("id", existingIds);
      }

      const saved: Group[] = [];
      for (const g of newGroups) {
        const { data: groupRow, error } = await client
          .from("groups")
          .insert({
            league_night_id: leagueNightId,
            group_number: g.groupNumber,
            avg_handicap: g.avgHandicap,
          })
          .select()
          .single();
        if (error) throw error;
        if (g.memberIds.length > 0) {
          const { error: gmError } = await client
            .from("group_members")
            .insert(g.memberIds.map((memberId) => ({ group_id: groupRow.id, member_id: memberId })));
          if (gmError) throw gmError;
        }
        saved.push({
          id: groupRow.id,
          leagueNightId,
          groupNumber: g.groupNumber,
          avgHandicap: g.avgHandicap,
          memberIds: g.memberIds,
        });
      }
      return saved;
    },

    async listScores(leagueNightId) {
      const { data, error } = await client
        .from("scores")
        .select("*")
        .eq("league_night_id", leagueNightId)
        .order("position");
      if (error) throw error;
      return (data ?? []).map(toScore);
    },
    async listScoresForSeason(seasonId) {
      const { data: nights, error: nightsError } = await client
        .from("league_nights")
        .select("id")
        .eq("season_id", seasonId);
      if (nightsError) throw nightsError;
      const nightIds = (nights ?? []).map((n: Row) => n.id as string);
      if (nightIds.length === 0) return [];
      const { data, error } = await client.from("scores").select("*").in("league_night_id", nightIds);
      if (error) throw error;
      return (data ?? []).map(toScore);
    },
    async saveScores(leagueNightId, input: ScoreInput[]) {
      const night = must(
        await this.getLeagueNight(leagueNightId),
        "League night not found",
      );

      const { data: memberRows, error: memberError } = await client
        .from("members")
        .select("id, handicap_index")
        .in(
          "id",
          input.map((s) => s.memberId),
        );
      if (memberError) throw memberError;
      const handicapByMember = new Map<string, number>(
        (memberRows ?? []).map((m: Row) => [m.id as string, Number(m.handicap_index)]),
      );

      const withNet = input.map((s) => ({
        memberId: s.memberId,
        grossScore: s.grossScore,
        netScore:
          Math.round((s.grossScore - (handicapByMember.get(s.memberId) ?? 0)) * 10) / 10,
      }));
      const ranked = rankNightScores(withNet);

      await client.from("scores").delete().eq("league_night_id", leagueNightId);
      const { data: savedRows, error: saveError } = await client
        .from("scores")
        .insert(
          ranked.map((r) => {
            const original = withNet.find((w) => w.memberId === r.memberId)!;
            return {
              league_night_id: leagueNightId,
              member_id: r.memberId,
              gross_score: original.grossScore,
              net_score: r.netScore,
              points: r.points,
              position: r.position,
            };
          }),
        )
        .select();
      if (saveError) throw saveError;

      // Recompute each participant's rolling handicap from their full score history.
      for (const s of ranked) {
        const { data: historyRows } = await client
          .from("scores")
          .select("gross_score, league_nights(date, course_par)")
          .eq("member_id", s.memberId);
        const history = (historyRows ?? []).map((row: Row) => {
          const relatedNight = row.league_nights as { course_par?: number; date?: string } | null;
          return {
            grossScore: row.gross_score as number,
            coursePar: relatedNight?.course_par ?? night.coursePar,
            playedAt: relatedNight?.date ?? "",
          };
        });
        const newHandicap = computeHandicapIndex(history);
        await client.from("members").update({ handicap_index: newHandicap }).eq("id", s.memberId);
      }

      await client.from("league_nights").update({ status: "completed" }).eq("id", leagueNightId);

      return (savedRows ?? []).map(toScore);
    },
    async getStandings(seasonId) {
      const [members, scores] = await Promise.all([
        this.listMembers(),
        this.listScoresForSeason(seasonId),
      ]);
      return computeStandings(members, scores);
    },

    async listPrizes() {
      const { data, error } = await client.from("prizes").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map(toPrize);
    },
    async createPrize(input: NewPrizeInput) {
      const { data, error } = await client
        .from("prizes")
        .insert({
          league_night_id: input.leagueNightId,
          season_id: input.seasonId,
          title: input.title,
          place: input.place,
          winner_member_id: input.winnerMemberId,
          notes: input.notes ?? null,
        })
        .select()
        .single();
      if (error) throw error;
      return toPrize(data);
    },
  };
}
