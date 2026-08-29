/**
 * Round formats offered for a league night — this is descriptive metadata
 * shown on the night/calendar, not a scoring engine: score entry and the
 * handicap/points math still assume individual stroke play regardless of
 * which format is picked here. Wiring up real team scoring for Scramble/
 * Best Ball/etc. (shared team score, different points rules per format) is
 * a separate, larger feature — this just lets the coach communicate what
 * the group is actually playing that night.
 */
export const GAME_TYPES = [
  { value: "stroke_play", label: "Stroke Play (Regular)" },
  { value: "stableford", label: "Stableford" },
  { value: "match_play", label: "Match Play" },
  { value: "scramble", label: "Scramble" },
  { value: "shamble", label: "Shamble" },
  { value: "best_ball", label: "Best Ball (Four-Ball)" },
  { value: "alternate_shot", label: "Alternate Shot (Foursomes)" },
  { value: "captains_choice", label: "Captain's Choice" },
  { value: "ryder_cup", label: "Ryder Cup (Team Format)" },
  { value: "skins", label: "Skins Game" },
  { value: "nassau", label: "Nassau" },
] as const;

export type GameType = (typeof GAME_TYPES)[number]["value"];

export const DEFAULT_GAME_TYPE: GameType = "stroke_play";

export function gameTypeLabel(value: string | null | undefined): string {
  return GAME_TYPES.find((g) => g.value === value)?.label ?? "Stroke Play (Regular)";
}
