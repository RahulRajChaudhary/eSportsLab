import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const revalidate = 60;

async function getStandings(tournamentId: string) {
  const entries = await prisma.bRMatchEntry.findMany({
    where: { brMatch: { tournamentId } },
    include: { team: true },
  });

  const byTeam = new Map<
    string,
    { teamId: string; teamName: string; matches: number; kills: number; points: number; wwcd: number }
  >();

  for (const entry of entries) {
    const row = byTeam.get(entry.teamId) ?? {
      teamId: entry.teamId,
      teamName: entry.team.name,
      matches: 0,
      kills: 0,
      points: 0,
      wwcd: 0,
    };
    row.matches += 1;
    row.kills += entry.kills;
    row.points += entry.pointsEarned;
    if (entry.placement === 1) row.wwcd += 1;
    byTeam.set(entry.teamId, row);
  }

  return Array.from(byTeam.values()).sort(
    (a, b) => b.points - a.points || b.kills - a.kills,
  );
}

const statusStyles: Record<string, string> = {
  ONGOING: "bg-blue-600 text-white",
  UPCOMING: "bg-blue-50 text-blue-700 border border-blue-200",
  COMPLETED: "bg-zinc-100 text-zinc-500 border border-zinc-200",
};

export default async function BgmiHub() {
  const game = await prisma.game.findUnique({ where: { slug: "bgmi" } });
  if (!game) notFound();

  const tournaments = await prisma.tournament.findMany({
    where: { gameId: game.id },
    orderBy: [{ startDate: "desc" }],
  });

  const featured =
    tournaments.find((t) => t.status === "ONGOING") ?? tournaments[0];

  const [standings, news, rankings] = await Promise.all([
    featured ? getStandings(featured.id) : Promise.resolve([]),
    prisma.newsPost.findMany({
      where: { gameId: game.id },
      orderBy: { publishedAt: "desc" },
      take: 5,
    }),
    prisma.rankingSnapshot.findMany({
      where: { gameId: game.id },
      orderBy: { rank: "asc" },
      take: 10,
      include: { team: true },
    }),
  ]);

  return (
    <div className="flex flex-1 flex-col bg-white text-zinc-900">
      {/* Page header on the box-grid pattern */}
      <section className="relative border-b border-zinc-100">
        <div className="bg-grid absolute inset-0" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-6 py-12">
          <span className="inline-block rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            Battle Royale
          </span>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            BGMI
          </h1>
          <p className="mt-2 max-w-xl text-zinc-600">
            Tournaments, standings, and rankings for India&apos;s biggest
            esport — verified against official sources.
          </p>
        </div>
      </section>

      <main className="mx-auto grid w-full max-w-6xl flex-1 gap-12 px-6 py-12 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <section>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-400">
              Tournaments
            </h2>
            <ul className="space-y-3">
              {tournaments.map((t) => (
                <li
                  key={t.id}
                  className="rounded-2xl border border-zinc-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-semibold">{t.name}</span>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[t.status] ?? statusStyles.COMPLETED}`}
                    >
                      {t.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-zinc-500">
                    {[t.tier, t.region, t.organizer]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </li>
              ))}
              {tournaments.length === 0 && (
                <p className="text-sm text-zinc-400">No tournaments yet.</p>
              )}
            </ul>
          </section>

          {featured && (
            <section className="mt-12">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-400">
                Standings — {featured.name}
              </h2>
              <div className="overflow-x-auto rounded-2xl border border-zinc-100 shadow-sm">
                <table className="w-full text-sm">
                  <thead className="border-b border-zinc-100 bg-blue-50/50 text-left text-xs font-semibold uppercase text-zinc-500">
                    <tr>
                      <th className="px-4 py-3">#</th>
                      <th className="px-4 py-3">Team</th>
                      <th className="px-4 py-3 text-right">Matches</th>
                      <th className="px-4 py-3 text-right">WWCD</th>
                      <th className="px-4 py-3 text-right">Kills</th>
                      <th className="px-4 py-3 text-right">Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {standings.map((row, i) => (
                      <tr
                        key={row.teamId}
                        className={`border-b border-zinc-50 last:border-0 ${i < 3 ? "bg-blue-50/30" : ""}`}
                      >
                        <td className="px-4 py-3 font-semibold text-zinc-400">
                          {i + 1}
                        </td>
                        <td className="px-4 py-3 font-medium">
                          {row.teamName}
                        </td>
                        <td className="px-4 py-3 text-right text-zinc-600">
                          {row.matches}
                        </td>
                        <td className="px-4 py-3 text-right text-zinc-600">
                          {row.wwcd}
                        </td>
                        <td className="px-4 py-3 text-right text-zinc-600">
                          {row.kills}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-blue-700">
                          {row.points}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-2 text-xs text-zinc-400">
                Top 3 highlighted · Points = placement + kills, per the
                tournament&apos;s points system
              </p>
            </section>
          )}
        </div>

        <div className="space-y-10">
          <section>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-400">
              Team rankings
            </h2>
            <ol className="overflow-hidden rounded-2xl border border-zinc-100 shadow-sm">
              {rankings.map((r, i) => (
                <li
                  key={r.id}
                  className={`flex items-center justify-between px-4 py-3 text-sm ${
                    i !== rankings.length - 1
                      ? "border-b border-zinc-50"
                      : ""
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                        i < 3
                          ? "bg-blue-600 text-white"
                          : "bg-zinc-100 text-zinc-500"
                      }`}
                    >
                      {r.rank}
                    </span>
                    <span className="font-medium">{r.team?.name}</span>
                  </span>
                  <span className="text-zinc-500">{r.points} pts</span>
                </li>
              ))}
              {rankings.length === 0 && (
                <p className="p-4 text-sm text-zinc-400">No rankings yet.</p>
              )}
            </ol>
          </section>

          <section>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-400">
              News
            </h2>
            <ul className="space-y-3">
              {news.map((post) => (
                <li
                  key={post.id}
                  className="rounded-2xl border border-zinc-100 bg-white p-5 shadow-sm"
                >
                  <p className="text-sm font-semibold">{post.title}</p>
                  <p className="mt-1 text-xs leading-5 text-zinc-500">
                    {post.body}
                  </p>
                </li>
              ))}
              {news.length === 0 && (
                <p className="text-sm text-zinc-400">No news yet.</p>
              )}
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
}
