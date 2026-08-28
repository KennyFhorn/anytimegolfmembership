import { AutoRefresh } from "@/components/auto-refresh";
import { getRepository } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function TvGroupsPage() {
  const repo = await getRepository();
  const night = (await repo.getNextLeagueNight()) ?? (await repo.listLeagueNights())[0] ?? null;
  const groups = night ? await repo.listGroups(night.id) : [];
  const members = await repo.listMembers();
  const memberById = new Map(members.map((m) => [m.id, m]));

  return (
    <div className="flex h-full flex-col">
      <AutoRefresh intervalSeconds={30} />
      <div className="mb-8 flex items-baseline justify-between">
        <h1 className="text-5xl font-bold tracking-tight">Tonight&apos;s Groups</h1>
        {night && (
          <p className="text-2xl text-white/60">
            {formatDate(night.date)} · {night.courseName}
          </p>
        )}
      </div>

      {!night || groups.length === 0 ? (
        <p className="text-3xl text-white/50">Groups haven&apos;t been posted yet.</p>
      ) : (
        <div className="grid flex-1 grid-cols-2 gap-6 lg:grid-cols-3">
          {[...groups]
            .sort((a, b) => a.groupNumber - b.groupNumber)
            .map((g) => (
              <div key={g.id} className="flex flex-col gap-3 rounded-2xl bg-white/5 p-6">
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl font-bold text-brand">Group {g.groupNumber}</span>
                  <span className="text-lg text-white/50">avg {g.avgHandicap?.toFixed(1)}</span>
                </div>
                <ul className="flex flex-col gap-1">
                  {g.memberIds.map((mid) => (
                    <li key={mid} className="text-2xl">
                      {memberById.get(mid)?.fullName ?? "—"}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
