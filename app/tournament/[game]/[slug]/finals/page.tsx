import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTournamentBySlug } from "@/lib/tournament-data";
import { SITE_URL, buildBreadcrumbJsonLd, jsonLdGraph } from "@/lib/seo";
import { StageSection } from "@/components/stage-section";
import { TeamAvatar } from "@/components/team-avatar";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ game: string; slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tournament = await getTournamentBySlug(slug);
  if (!tournament) return {};

  const title = `${tournament.name} Grand Finals — Results & Rosters | EsportsLab`;
  const url = `${SITE_URL}/tournament/${tournament.game.slug}/${tournament.slug}/finals`;

  return {
    title,
    description: `Grand finals results and team rosters for ${tournament.name}.`,
    alternates: { canonical: url },
    openGraph: { title, url, type: "website" },
  };
}

export default async function TournamentFinals({
  params,
}: {
  params: Promise<{ game: string; slug: string }>;
}) {
  const { game: gameSlug, slug } = await params;
  const tournament = await getTournamentBySlug(slug);
  if (!tournament || tournament.game.slug !== gameSlug) notFound();

  const isBR = tournament.game.formatType === "BR";
  const pointsPerKill = tournament.pointsSystem?.pointsPerKill ?? 1;
  const stages = tournament.stages;
  const finalStage = stages.length > 0 ? stages[stages.length - 1] : null;

  const groupedStandings = new Map<string, typeof tournament.groupStandingsRows>();
  for (const row of tournament.groupStandingsRows) {
    const list = groupedStandings.get(row.groupName) ?? [];
    list.push(row);
    groupedStandings.set(row.groupName, list);
  }

  const url = `${SITE_URL}/tournament/${tournament.game.slug}/${tournament.slug}/finals`;
  const jsonLd = jsonLdGraph(
    buildBreadcrumbJsonLd([
      { name: "Home", url: SITE_URL },
      { name: "Tournaments", url: `${SITE_URL}/tournament` },
      { name: tournament.game.name, url: `${SITE_URL}/tournament/${tournament.game.slug}` },
      { name: tournament.name, url: `${SITE_URL}/tournament/${tournament.game.slug}/${tournament.slug}` },
      { name: "Grand Finals", url },
    ]),
  );

  return (
    <div className="space-y-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <h1 className="sr-only">{tournament.name} Grand Finals</h1>

      {finalStage ? (
        <StageSection
          stage={finalStage}
          isBR={isBR}
          pointsPerKill={pointsPerKill}
          groupedStandings={groupedStandings}
        />
      ) : (
        <p className="text-sm text-zinc-400">Grand Finals not scheduled yet.</p>
      )}

      {tournament.participants.length > 0 && (
        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-400">
            Team Rosters
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tournament.participants.map((participant) => {
              const { team } = participant;
              const coach = team.rosterHistory.find((r) => r.role === "Coach");
              const players = team.rosterHistory.filter((r) => r.role !== "Coach");
              return (
                <div key={participant.id} className="rounded-2xl border border-zinc-100 bg-white p-4 shadow-sm">
                  <Link href={`/team/${team.slug}`} className="mb-3 flex items-center gap-3">
                    <TeamAvatar name={team.name} logoUrl={team.logoUrl} size={40} />
                    <p className="font-semibold hover:text-blue-700 hover:underline">{team.name}</p>
                  </Link>
                  {players.length === 0 ? (
                    <p className="text-sm text-zinc-400">Roster TBA.</p>
                  ) : (
                    <ul className="space-y-1.5 text-sm">
                      {players.map((r) => (
                        <li key={r.id} className="flex items-center justify-between gap-3">
                          <Link href={`/player/${r.player.slug}`} className="text-zinc-700 hover:text-blue-700 hover:underline">
                            {r.player.name}
                          </Link>
                          <span className="text-xs font-medium text-zinc-400">{r.role}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {coach && (
                    <p className="mt-3 border-t border-zinc-100 pt-2 text-xs text-zinc-400">
                      Coach{" "}
                      <Link href={`/player/${coach.player.slug}`} className="font-medium text-zinc-600 hover:text-blue-700 hover:underline">
                        {coach.player.name}
                      </Link>
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
