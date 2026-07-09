import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTournamentBySlug, stageStatus } from "@/lib/tournament-data";
import { formatDateRange, formatINR } from "@/lib/format";
import { SITE_URL, buildBreadcrumbJsonLd, buildSportsEventJsonLd, jsonLdGraph } from "@/lib/seo";
import { TeamAvatar } from "@/components/team-avatar";
import { TournamentCalendar } from "@/components/tournament-calendar";
import { StageRoadmapTimeline } from "@/components/stage-roadmap-timeline";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ game: string; slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tournament = await getTournamentBySlug(slug);
  if (!tournament) return {};

  const title = `${tournament.name} — Schedule, Standings & Results | EsportsLab`;
  const description = [
    tournament.tier,
    tournament.game.name,
    formatDateRange(tournament.startDate, tournament.endDate),
    tournament.prizePool ? `${formatINR(tournament.prizePool)} prize pool` : null,
  ]
    .filter(Boolean)
    .join(" · ");
  const url = `${SITE_URL}/tournament/${tournament.game.slug}/${tournament.slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: "website" },
  };
}

export default async function TournamentOverview({
  params,
}: {
  params: Promise<{ game: string; slug: string }>;
}) {
  const { game: gameSlug, slug } = await params;
  const tournament = await getTournamentBySlug(slug);
  if (!tournament || tournament.game.slug !== gameSlug) notFound();

  const isBR = tournament.game.formatType === "BR";
  const stages = tournament.stages;

  const url = `${SITE_URL}/tournament/${tournament.game.slug}/${tournament.slug}`;
  const jsonLd = jsonLdGraph(
    buildSportsEventJsonLd({
      name: tournament.name,
      url,
      startDate: tournament.startDate,
      endDate: tournament.endDate,
      region: tournament.region,
      organizer: tournament.organizer,
      status: tournament.status,
      imageUrl: tournament.game.logoUrl,
    }),
    buildBreadcrumbJsonLd([
      { name: "Home", url: SITE_URL },
      { name: "Tournaments", url: `${SITE_URL}/tournament` },
      { name: tournament.game.name, url: `${SITE_URL}/tournament/${tournament.game.slug}` },
      { name: tournament.name, url },
    ]),
  );

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />

      <div className="space-y-10">
        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-400">
            Format
          </h2>
          <StageRoadmapTimeline
            game={gameSlug}
            slug={slug}
            stages={stages.map((stage) => ({
              id: stage.id,
              name: stage.name,
              startDate: stage.startDate,
              endDate: stage.endDate,
              status: stageStatus(stage),
            }))}
          />
        </section>

        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-400">
            Calendar
          </h2>
          <TournamentCalendar stages={stages} />
        </section>

        {Array.isArray(tournament.prizeBreakdownJson) && tournament.prizeBreakdownJson.length > 0 && (
          <section>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-400">
              Prize Pool Distribution
            </h2>
            <div className="overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-sm">
              <table className="w-full text-sm">
                <thead className="border-b border-zinc-100 bg-blue-50/50 text-left text-xs font-semibold uppercase text-zinc-500">
                  <tr>
                    <th className="px-4 py-3">Placement</th>
                    <th className="px-4 py-3 text-right">Prize</th>
                  </tr>
                </thead>
                <tbody>
                  {(tournament.prizeBreakdownJson as { rank: string; amountInr: number }[]).map((row) => (
                    <tr key={row.rank} className="border-b border-zinc-50 last:border-0">
                      <td className="px-4 py-3 font-medium">{row.rank}</td>
                      <td className="px-4 py-3 text-right font-bold text-blue-700">
                        {formatINR(row.amountInr)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {tournament.awards.length > 0 && (
          <section>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-400">
              Special Awards
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {tournament.awards.map((award) => {
                const name = award.player?.name ?? award.team?.name ?? "TBA";
                const logoUrl = award.player ? null : (award.team?.logoUrl ?? null);
                return (
                  <div
                    key={award.id}
                    className="flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50/60 p-4 shadow-sm"
                  >
                    <TeamAvatar name={name} logoUrl={logoUrl} size={40} />
                    <div>
                      <p className="text-xs font-bold tracking-wide text-cyan-600 uppercase">
                        {award.category}
                      </p>
                      <p className="font-semibold text-blue-900">{name}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>

      <section className="overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-sm">
        <div className="h-16 bg-gradient-to-r from-blue-600 to-cyan-500" />
        <div className="px-5 pb-5">
          <div className="-mt-8 mb-4 flex items-end gap-3">
            <div className="rounded-full border-4 border-white shadow-md">
              <TeamAvatar name={tournament.name} logoUrl={tournament.logoUrl ?? tournament.game.logoUrl} size={56} />
            </div>
            <div className="pb-1">
              <p className="font-semibold leading-tight">{tournament.name}</p>
              <p className="text-xs text-zinc-400">{tournament.game.name}</p>
            </div>
          </div>

          <dl className="space-y-3 text-sm">
            {tournament.eventType && (
              <div className="flex items-center justify-between gap-4">
                <dt className="flex items-center gap-1.5 text-zinc-400">
                  <span aria-hidden>🖥️</span> Type
                </dt>
                <dd className="font-medium">{tournament.eventType}</dd>
              </div>
            )}
            <div className="flex items-center justify-between gap-4">
              <dt className="flex items-center gap-1.5 text-zinc-400">
                <span aria-hidden>🎮</span> Mode
              </dt>
              <dd className="font-medium">{isBR ? "Squads TPP" : "5v5"}</dd>
            </div>
            {tournament.series && (
              <div className="flex items-center justify-between gap-4">
                <dt className="flex items-center gap-1.5 text-zinc-400">
                  <span aria-hidden>🧩</span> Series
                </dt>
                <dd className="font-medium">{tournament.series}</dd>
              </div>
            )}
            {tournament.season && (
              <div className="flex items-center justify-between gap-4">
                <dt className="flex items-center gap-1.5 text-zinc-400">
                  <span aria-hidden>🗓️</span> Season
                </dt>
                <dd className="font-medium">{tournament.season}</dd>
              </div>
            )}

            {tournament.status === "COMPLETED" && (
              <>
                <div className="flex items-center justify-between gap-4 border-t border-zinc-100 pt-3">
                  <dt className="text-zinc-400">Winner</dt>
                  <dd className="flex items-center gap-2 font-semibold text-amber-700">
                    {tournament.winner ? (
                      <>
                        <span aria-hidden>🏆</span>
                        {tournament.showTeamLogos && (
                          <TeamAvatar name={tournament.winner.name} logoUrl={tournament.winner.logoUrl} size={20} />
                        )}
                        <Link href={`/team/${tournament.winner.slug}`} className="hover:underline">
                          {tournament.winner.name}
                        </Link>
                      </>
                    ) : (
                      "TBA"
                    )}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-zinc-400">Runner Up</dt>
                  <dd className="flex items-center gap-2 font-medium">
                    {tournament.runnerUp ? (
                      <>
                        {tournament.showTeamLogos && (
                          <TeamAvatar name={tournament.runnerUp.name} logoUrl={tournament.runnerUp.logoUrl} size={20} />
                        )}
                        <Link href={`/team/${tournament.runnerUp.slug}`} className="hover:text-blue-700 hover:underline">
                          {tournament.runnerUp.name}
                        </Link>
                      </>
                    ) : (
                      "TBA"
                    )}
                  </dd>
                </div>
              </>
            )}
          </dl>
        </div>
      </section>
    </div>
  );
}
