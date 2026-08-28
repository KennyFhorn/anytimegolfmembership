"use server";

import { revalidatePath } from "next/cache";
import { generateBalancedGroups } from "@/lib/grouping";
import { getRepository } from "@/lib/data";
import { requireAdmin } from "@/lib/auth";
import type { PaymentStatus } from "@/lib/types";

export async function generateGroupsAction(leagueNightId: string) {
  await requireAdmin();
  const repo = await getRepository();

  const [registrations, members] = await Promise.all([
    repo.listRegistrations(leagueNightId),
    repo.listMembers(),
  ]);
  const eligibleIds = new Set(
    registrations.filter((r) => r.status === "registered" && r.paymentStatus === "paid").map((r) => r.memberId),
  );
  const eligibleMembers = members.filter((m) => eligibleIds.has(m.id));

  const groups = generateBalancedGroups(eligibleMembers);
  await repo.saveGroups(
    leagueNightId,
    groups.map((g) => ({
      groupNumber: g.groupNumber,
      avgHandicap: g.avgHandicap,
      memberIds: g.members.map((m) => m.id),
    })),
  );

  revalidatePath(`/admin/leagues/${leagueNightId}`);
}

export async function swapGroupMembersAction(
  leagueNightId: string,
  memberIdA: string,
  memberIdB: string,
) {
  await requireAdmin();
  if (!memberIdA || !memberIdB || memberIdA === memberIdB) return;
  const repo = await getRepository();

  const [groups, members] = await Promise.all([repo.listGroups(leagueNightId), repo.listMembers()]);
  const handicapById = new Map(members.map((m) => [m.id, m.handicapIndex]));

  const groupOf = (memberId: string) => groups.find((g) => g.memberIds.includes(memberId));
  const groupA = groupOf(memberIdA);
  const groupB = groupOf(memberIdB);
  if (!groupA || !groupB || groupA.id === groupB.id) return;

  const nextGroups = groups.map((g) => {
    if (g.id === groupA.id) {
      return { ...g, memberIds: g.memberIds.map((id) => (id === memberIdA ? memberIdB : id)) };
    }
    if (g.id === groupB.id) {
      return { ...g, memberIds: g.memberIds.map((id) => (id === memberIdB ? memberIdA : id)) };
    }
    return g;
  });

  await repo.saveGroups(
    leagueNightId,
    nextGroups.map((g) => ({
      groupNumber: g.groupNumber,
      avgHandicap:
        Math.round(
          (g.memberIds.reduce((sum, id) => sum + (handicapById.get(id) ?? 0), 0) / g.memberIds.length) * 10,
        ) / 10,
      memberIds: g.memberIds,
    })),
  );

  revalidatePath(`/admin/leagues/${leagueNightId}`);
}

export async function adminRegisterMemberAction(leagueNightId: string, formData: FormData) {
  await requireAdmin();
  const repo = await getRepository();
  const memberId = String(formData.get("memberId") ?? "");
  if (!memberId) return;
  const registration = await repo.registerMember(leagueNightId, memberId);
  await repo.setPaymentStatus(registration.id, "paid");
  revalidatePath(`/admin/leagues/${leagueNightId}`);
}

export async function setPaymentStatusAction(registrationId: string, status: PaymentStatus, leagueNightId: string) {
  await requireAdmin();
  const repo = await getRepository();
  await repo.setPaymentStatus(registrationId, status);
  revalidatePath(`/admin/leagues/${leagueNightId}`);
}

export async function saveScoresAction(leagueNightId: string, formData: FormData) {
  await requireAdmin();
  const repo = await getRepository();

  const scores: { memberId: string; grossScore: number }[] = [];
  for (const [key, value] of formData.entries()) {
    if (!key.startsWith("score_")) continue;
    const grossScore = Number(value);
    if (!Number.isFinite(grossScore) || grossScore <= 0) continue;
    scores.push({ memberId: key.replace("score_", ""), grossScore });
  }
  if (scores.length === 0) return;

  await repo.saveScores(leagueNightId, scores);
  revalidatePath(`/admin/leagues/${leagueNightId}`);
  revalidatePath("/standings");
  revalidatePath("/tv/leaderboard");
  revalidatePath("/tv/standings");
}
