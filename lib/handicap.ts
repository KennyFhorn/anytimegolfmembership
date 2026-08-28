/**
 * Simplified WHS-style rolling handicap: average of the best ~50% of
 * differentials (gross score − course par) from the most recent rounds.
 * Differentials are clamped to a small floor to keep hot/cold single
 * rounds from swinging a member's handicap too hard.
 */
export interface RoundResult {
  grossScore: number;
  coursePar: number;
  playedAt: string; // ISO date, used to keep only the most recent rounds
}

const MAX_ROUNDS_CONSIDERED = 8;
const MIN_HANDICAP = 0;
const MAX_HANDICAP = 40;
const DEFAULT_HANDICAP = 18;

export function computeHandicapIndex(rounds: RoundResult[]): number {
  if (rounds.length === 0) return DEFAULT_HANDICAP;

  const recent = [...rounds]
    .sort((a, b) => b.playedAt.localeCompare(a.playedAt))
    .slice(0, MAX_ROUNDS_CONSIDERED)
    .map((r) => r.grossScore - r.coursePar);

  const bestCount = Math.max(1, Math.round(recent.length / 2));
  const best = [...recent].sort((a, b) => a - b).slice(0, bestCount);

  const avg = best.reduce((sum, d) => sum + d, 0) / best.length;
  const rounded = Math.round(avg * 10) / 10;

  return Math.min(MAX_HANDICAP, Math.max(MIN_HANDICAP, rounded));
}
