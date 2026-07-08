import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCountry } from "@/lib/format";
import { TeamAvatar } from "@/components/team-avatar";

export const revalidate = 60;

export default async function PlayerDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const player = await prisma.player.findUnique({
    where: { slug },
    include: {
      game: true,
      rosterHistory: {
        include: { team: true },
        orderBy: { joinedAt: "asc" },
      },
      tournamentAwards: {
        include: { tournament: true },
        orderBy: { tournament: { startDate: "desc" } },
      },
    },
  });

  if (!player) notFound();

  const currentEntry = player.rosterHistory.find((r) => r.leftAt === null);
  const pastEntries = player.rosterHistory
    .filter((r) => r.leftAt !== null)
    .sort((a, b) => b.joinedAt.getTime() - a.joinedAt.getTime());

  const socials = (player.socials as Record<string, string> | null) ?? null;

  return (
    <div className="flex flex-1 flex-col text-zinc-900">
      <section className="border-b border-zinc-100">
        <div className="mx-auto max-w-5xl px-6 pt-12 pb-6">
          <Link
            href={`/${player.game.slug}`}
            className="text-sm font-medium text-blue-700 hover:underline"
          >
            ← {player.game.name}
          </Link>

          <div className="mt-4 flex items-center gap-4">
            <TeamAvatar name={player.name} logoUrl={null} size={64} />
            <div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{player.name}</h1>
              <p className="mt-1 text-sm text-zinc-500">
                {[player.realName, formatCountry(player.country)].filter(Boolean).join(" · ")}
              </p>
            </div>
          </div>

          {socials && Object.keys(socials).length > 0 && (
            <div className="mt-4 flex flex-wrap gap-3">
              {Object.entries(socials).map(([platform, url]) => (
                <a
                  key={platform}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-zinc-200 px-3 py-1 text-xs font-medium text-zinc-600 hover:border-blue-300 hover:text-blue-700"
                >
                  {platform}
                </a>
              ))}
            </div>
          )}
        </div>
      </section>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-12">
        <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
          <div className="space-y-10">
            <section>
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-400">
                Current Team
              </h2>
              {currentEntry ? (
                <Link
                  href={`/team/${currentEntry.team.slug}`}
                  className="flex items-center gap-3 rounded-2xl border border-zinc-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
                >
                  <TeamAvatar
                    name={currentEntry.team.name}
                    logoUrl={currentEntry.team.logoUrl}
                    size={40}
                  />
                  <div>
                    <p className="font-semibold">{currentEntry.team.name}</p>
                    <p className="text-xs text-zinc-400">{currentEntry.role}</p>
                  </div>
                </Link>
              ) : (
                <p className="text-sm text-zinc-400">Currently a free agent.</p>
              )}
            </section>

            {pastEntries.length > 0 && (
              <section>
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-400">
                  Past Teams
                </h2>
                <ul className="space-y-2">
                  {pastEntries.map((r) => (
                    <li
                      key={r.id}
                      className="flex items-center justify-between rounded-xl border border-zinc-100 bg-white px-4 py-3 text-sm shadow-sm"
                    >
                      <Link
                        href={`/team/${r.team.slug}`}
                        className="font-medium text-blue-700 hover:underline"
                      >
                        {r.team.name}
                      </Link>
                      <span className="text-xs text-zinc-400">{r.role}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          {player.tournamentAwards.length > 0 && (
            <section className="overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-sm">
              <div className="h-3 bg-gradient-to-r from-blue-600 to-cyan-500" />
              <div className="p-5">
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-400">
                  Awards
                </h2>
                <ul className="space-y-3">
                  {player.tournamentAwards.map((award) => (
                    <li key={award.id} className="text-sm">
                      <p className="font-medium text-amber-700">{award.category}</p>
                      <Link
                        href={`/tournament/${player.game.slug}/${award.tournament.slug}`}
                        className="text-xs text-zinc-500 hover:underline"
                      >
                        {award.tournament.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
