import type { Member } from "./types";

export interface HandicapBalancedGroup {
  groupNumber: number;
  members: Member[];
  avgHandicap: number;
}

/**
 * Splits members into groups of (up to) 4 balanced by handicap using a snake
 * seed: sort ascending by handicap, then deal into groups in boustrophedon
 * order (1,2,3,4,4,3,2,1,...) so every group ends up with a mix of low and
 * high handicaps instead of clustering the best/worst players together.
 */
export function generateBalancedGroups(
  members: Member[],
  groupSize = 4,
): HandicapBalancedGroup[] {
  if (members.length === 0) return [];

  const groupCount = Math.max(1, Math.ceil(members.length / groupSize));
  const sorted = [...members].sort((a, b) => a.handicapIndex - b.handicapIndex);

  const buckets: Member[][] = Array.from({ length: groupCount }, () => []);

  let groupIndex = 0;
  let direction = 1;
  for (const member of sorted) {
    buckets[groupIndex].push(member);
    if (groupIndex + direction >= groupCount || groupIndex + direction < 0) {
      direction *= -1;
    } else {
      groupIndex += direction;
    }
  }

  return buckets
    .map((groupMembers, index) => ({
      groupNumber: index + 1,
      members: groupMembers,
      avgHandicap:
        groupMembers.length === 0
          ? 0
          : Math.round(
              (groupMembers.reduce((sum, m) => sum + m.handicapIndex, 0) /
                groupMembers.length) *
                10,
            ) / 10,
    }))
    .filter((g) => g.members.length > 0);
}
