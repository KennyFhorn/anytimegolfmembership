import type { Member, Score, StandingRow } from "./types";

/** Points awarded by finishing position for a single league night. */
const POSITION_POINTS: Record<number, number> = {
  1: 20,
  2: 18,
  3: 16,
  4: 14,
  5: 12,
  6: 10,
  7: 9,
  8: 8,
  9: 7,
  10: 6,
};
const PARTICIPATION_POINTS = 4;

export function pointsForPosition(position: number): number {
  return POSITION_POINTS[position] ?? PARTICIPATION_POINTS;
}

/** Ranks a night's scores by net score (ascending) and assigns positions + points. */
export function rankNightScores(
  scores: { memberId: string; netScore: number }[],
): { memberId: string; netScore: number; position: number; points: number }[] {
  const sorted = [...scores].sort((a, b) => a.netScore - b.netScore);
  return sorted.map((s, index) => {
    const position = index + 1;
    return { ...s, position, points: pointsForPosition(position) };
  });
}

/** Aggregates all scores for a season into a ranked standings table. */
export function computeStandings(members: Member[], scores: Score[]): StandingRow[] {
  const byMember = new Map<string, Score[]>();
  for (const score of scores) {
    const list = byMember.get(score.memberId) ?? [];
    list.push(score);
    byMember.set(score.memberId, list);
  }

  const rows: Omit<StandingRow, "rank">[] = members
    .map((member) => {
      const memberScores = byMember.get(member.id) ?? [];
      const roundsPlayed = memberScores.length;
      const totalPoints = memberScores.reduce((sum, s) => sum + s.points, 0);
      const wins = memberScores.filter((s) => s.position === 1).length;
      const avgNetScore =
        roundsPlayed === 0
          ? null
          : Math.round(
              (memberScores.reduce((sum, s) => sum + s.netScore, 0) / roundsPlayed) * 10,
            ) / 10;

      return {
        memberId: member.id,
        fullName: member.fullName,
        handicapIndex: member.handicapIndex,
        roundsPlayed,
        wins,
        totalPoints,
        avgNetScore,
      };
    })
    .filter((row) => row.roundsPlayed > 0)
    .sort((a, b) => b.totalPoints - a.totalPoints || b.wins - a.wins);

  return rows.map((row, index) => ({ ...row, rank: index + 1 }));
}
