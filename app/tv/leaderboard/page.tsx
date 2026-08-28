import { AutoRefresh } from "@/components/auto-refresh";
import { getRepository } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

const PLACE_COLOR: Record<number, string> = {
  1: "text-gold",
  2: "text-zinc-300",
  3: "text-amber-700",
};

export default async function TvLeaderboardPage() {
  const repo = await getRepository();
  const nights = await repo.listLeagueNights();
  const night =
    nights.find((n) => n.status === "in_progress") ??
    nights.find((n) => n.status === "completed") ??
    null;

  const scores = night ? await repo.listScores(night.id) : [];
  const members = await repo.listMembers();
  const memberById = new Map(members.map((m) => [m.id, m]));

  return (
    <div className="flex h-full flex-col">
      <AutoRefresh intervalSeconds={20} />
      <div className="mb-8 flex items-baseline justify-between">
        <h1 className="text-5xl font-bold tracking-tight">Tonight&apos;s Leaderboard</h1>
        {night && (
          <p className="text-2xl text-white/60">
            {formatDate(night.date)} · {night.courseName}
          </p>
        )}
      </div>

      {!night || scores.length === 0 ? (
        <p className="text-3xl text-white/50">Scores will appear here once the round is posted.</p>
      ) : (
        <div className="flex flex-1 flex-col gap-2">
          {[...scores]
            .sort((a, b) => (a.position ?? 99) - (b.position ?? 99))
            .map((s) => (
              <div
                key={s.id}
                className="grid grid-cols-[80px_1fr_140px_140px_120px] items-center gap-4 rounded-xl bg-white/5 px-6 py-3"
              >
                <span className={`text-4xl font-bold ${PLACE_COLOR[s.position ?? 0] ?? "text-white/70"}`}>
                  {s.position}
                </span>
                <span className="text-3xl font-medium">{memberById.get(s.memberId)?.fullName ?? "—"}</span>
                <span className="text-2xl text-white/60 text-right">Gross {s.grossScore}</span>
                <span className="text-2xl text-white/60 text-right">Net {s.netScore}</span>
                <span className="text-2xl font-semibold text-brand text-right">{s.points} pts</span>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
