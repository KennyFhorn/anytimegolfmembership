import { AutoRefresh } from "@/components/auto-refresh";
import { getRepository } from "@/lib/data";

export const dynamic = "force-dynamic";

const PLACE_COLOR: Record<number, string> = {
  1: "text-gold",
  2: "text-zinc-300",
  3: "text-amber-700",
};

export default async function TvStandingsPage() {
  const repo = await getRepository();
  const season = await repo.getActiveSeason();
  const standings = season ? await repo.getStandings(season.id) : [];

  return (
    <div className="flex h-full flex-col">
      <AutoRefresh intervalSeconds={30} />
      <div className="mb-8 flex items-baseline justify-between">
        <h1 className="text-5xl font-bold tracking-tight">Season Standings</h1>
        <p className="text-2xl text-white/60">{season?.name}</p>
      </div>

      {standings.length === 0 ? (
        <p className="text-3xl text-white/50">No rounds recorded yet this season.</p>
      ) : (
        <div className="flex flex-1 flex-col gap-2">
          {standings.slice(0, 12).map((row) => (
            <div
              key={row.memberId}
              className="grid grid-cols-[80px_1fr_160px_140px] items-center gap-4 rounded-xl bg-white/5 px-6 py-3"
            >
              <span className={`text-4xl font-bold ${PLACE_COLOR[row.rank] ?? "text-white/70"}`}>#{row.rank}</span>
              <span className="text-3xl font-medium">{row.fullName}</span>
              <span className="text-2xl text-white/60 text-right">{row.wins} wins</span>
              <span className="text-2xl font-semibold text-brand text-right">{row.totalPoints} pts</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
