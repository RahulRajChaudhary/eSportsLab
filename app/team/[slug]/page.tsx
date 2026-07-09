import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDateRange } from "@/lib/format";
import { TeamAvatar } from "@/components/team-avatar";

export const revalidate = 60;

const statusStyles: Record<string, string> = {
  ONGOING: "bg-blue-600 text-white",
  UPCOMING: "bg-blue-50 text-blue-700 border border-blue-200",
  COMPLETED: "bg-zinc-100 text-zinc-500 border border-zinc-200",
};

export default async function TeamDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const team = await prisma.team.findUnique({
    where: { slug },
    include: {
      game: true,
      rosterHistory: {
        include: { player: true },
        orderBy: { joinedAt: "asc" },
      },
      tournamentTeams: {
        include: { tournament: true },
        orderBy: { tournament: { startDate: "desc" } },
      },
      tournamentsWon: true,
      tournamentsRunnerUp: true,
      tournamentAwards: {
        include: { player: true },
        orderBy: { order: "asc" },
      },
    },
  });

  if (!team) notFound();

  const currentRoster = team.rosterHistory.filter(
    (r) => r.leftAt === null && r.role !== "Coach" && r.role !== "Substitute",
  );
  const substitutes = team.rosterHistory.filter(
    (r) => r.leftAt === null && r.role === "Substitute",
  );
  const coach = team.rosterHistory.find((r) => r.leftAt === null && r.role === "Coach");
  const pastRoster = team.rosterHistory.filter((r) => r.leftAt !== null);

  const wonIds = new Set(team.tournamentsWon.map((t) => t.id));
  const runnerUpIds = new Set(team.tournamentsRunnerUp.map((t) => t.id));

  const socials = (team.socials as Record<string, string> | null) ?? null;

  return (
    <div className="flex flex-1 flex-col text-zinc-900">
      <section className="border-b border-zinc-100">
        <div className="mx-auto max-w-5xl px-6 pt-12 pb-6">
          <Link
            href={`/${team.game.slug}`}
            className="text-sm font-medium text-blue-700 hover:underline"
          >
            ← {team.game.name}
          </Link>

          <div className="mt-4 flex items-center gap-4">
            <TeamAvatar name={team.name} logoUrl={team.logoUrl} size={64} />
            <div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{team.name}</h1>
              <p className="mt-1 text-sm text-zinc-500">
                {[team.region, team.game.name].filter(Boolean).join(" · ")}
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
                Current Roster
              </h2>
              {currentRoster.length === 0 ? (
                <p className="text-sm text-zinc-400">Roster TBA.</p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {currentRoster.map((r) => (
                    <Link
                      key={r.id}
                      href={`/player/${r.player.slug}`}
                      className="flex items-center gap-3 rounded-xl border border-zinc-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                    >
                      <TeamAvatar name={r.player.name} logoUrl={r.player.imageUrl} size={36} />
                      <div>
                        <p className="font-semibold">{r.player.name}</p>
                        <p className="text-xs text-zinc-400">{r.role}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {substitutes.length > 0 && (
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {substitutes.map((r) => (
                    <Link
                      key={r.id}
                      href={`/player/${r.player.slug}`}
                      className="flex items-center gap-3 rounded-xl border border-dashed border-zinc-200 bg-zinc-50 p-4 shadow-sm transition-shadow hover:shadow-md"
                    >
                      <TeamAvatar name={r.player.name} logoUrl={r.player.imageUrl} size={36} />
                      <div>
                        <p className="font-semibold">{r.player.name}</p>
                        <p className="text-xs text-zinc-400">Substitute</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {coach && (
                <p className="mt-4 text-sm text-zinc-500">
                  Coach{" "}
                  <Link
                    href={`/player/${coach.player.slug}`}
                    className="font-medium text-blue-700 hover:underline"
                  >
                    {coach.player.name}
                  </Link>
                </p>
              )}
            </section>

            {pastRoster.length > 0 && (
              <section>
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-400">
                  Past Roster
                </h2>
                <ul className="space-y-2">
                  {pastRoster.map((r) => (
                    <li
                      key={r.id}
                      className="flex items-center justify-between rounded-xl border border-zinc-100 bg-white px-4 py-3 text-sm shadow-sm"
                    >
                      <Link
                        href={`/player/${r.player.slug}`}
                        className="font-medium text-blue-700 hover:underline"
                      >
                        {r.player.name}
                      </Link>
                      <span className="text-xs text-zinc-400">{r.role}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section>
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-400">
                Tournament History
              </h2>
              {team.tournamentTeams.length === 0 ? (
                <p className="text-sm text-zinc-400">No tournaments yet.</p>
              ) : (
                <ul className="space-y-3">
                  {team.tournamentTeams.map(({ tournament }) => (
                    <li key={tournament.id}>
                      <Link
                        href={`/tournament/${team.game.slug}/${tournament.slug}`}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-zinc-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
                      >
                        <div>
                          <p className="font-semibold">{tournament.name}</p>
                          <p className="mt-1 text-xs text-zinc-500">
                            {formatDateRange(tournament.startDate, tournament.endDate)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {wonIds.has(tournament.id) && (
                            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                              🏆 Winner
                            </span>
                          )}
                          {runnerUpIds.has(tournament.id) && (
                            <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-600">
                              Runner-up
                            </span>
                          )}
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              statusStyles[tournament.status] ?? statusStyles.COMPLETED
                            }`}
                          >
                            {tournament.status}
                          </span>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          {team.tournamentAwards.length > 0 && (
            <section className="overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-sm">
              <div className="h-3 bg-gradient-to-r from-blue-600 to-cyan-500" />
              <div className="p-5">
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-400">
                  Awards
                </h2>
                <ul className="space-y-2">
                  {team.tournamentAwards.map((award) => (
                    <li key={award.id} className="flex items-center justify-between text-sm">
                      <span className="text-zinc-600">{award.category}</span>
                      {award.player && (
                        <Link
                          href={`/player/${award.player.slug}`}
                          className="font-medium text-blue-700 hover:underline"
                        >
                          {award.player.name}
                        </Link>
                      )}
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
