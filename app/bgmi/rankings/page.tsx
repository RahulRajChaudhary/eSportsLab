import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { TeamAvatar } from "@/components/team-avatar";

export const revalidate = 60;

export default async function BgmiRankings() {
  const game = await prisma.game.findUnique({ where: { slug: "bgmi" } });
  if (!game) notFound();

  const rankings = await prisma.rankingSnapshot.findMany({
    where: { gameId: game.id },
    orderBy: { rank: "asc" },
    include: { team: true },
  });

  return (
    <div className="flex flex-1 flex-col text-zinc-900">
      <section className="relative border-b border-zinc-100">
        <div className="relative mx-auto max-w-3xl px-6 py-12">
          <Link
            href="/bgmi"
            className="text-sm font-medium text-blue-700 hover:underline"
          >
            ← Back to BGMI hub
          </Link>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Official ranking leaderboard
          </h1>
          <p className="mt-2 max-w-xl text-zinc-600">
            Full team rankings for BGMI, updated by EsportsLab editors.
          </p>
        </div>
      </section>

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
        <ol className="overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-sm">
          {rankings.map((r, i) => (
            <li
              key={r.id}
              className={`flex items-center justify-between px-5 py-4 text-sm ${
                i !== rankings.length - 1 ? "border-b border-zinc-50" : ""
              }`}
            >
              <span className="flex items-center gap-4">
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                    i < 3 ? "bg-blue-600 text-white" : "bg-zinc-100 text-zinc-500"
                  }`}
                >
                  {r.rank}
                </span>
                {r.team && (
                  <TeamAvatar name={r.team.name} logoUrl={r.team.logoUrl} />
                )}
                {r.team ? (
                  <Link
                    href={`/team/${r.team.slug}`}
                    className="font-medium hover:text-blue-700 hover:underline"
                  >
                    {r.team.name}
                  </Link>
                ) : (
                  <span className="font-medium">—</span>
                )}
              </span>
              <span className="text-zinc-500">{r.points} pts</span>
            </li>
          ))}
          {rankings.length === 0 && (
            <p className="p-4 text-sm text-zinc-400">No rankings yet.</p>
          )}
        </ol>
      </main>
    </div>
  );
}
