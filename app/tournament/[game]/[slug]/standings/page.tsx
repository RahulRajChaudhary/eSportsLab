import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTournamentBySlug, stageStatus } from "@/lib/tournament-data";
import { SITE_URL, buildBreadcrumbJsonLd, jsonLdGraph } from "@/lib/seo";
import { StageSection } from "@/components/stage-section";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ game: string; slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tournament = await getTournamentBySlug(slug);
  if (!tournament) return {};

  const title = `${tournament.name} Standings & Points Table | EsportsLab`;
  const url = `${SITE_URL}/tournament/${tournament.game.slug}/${tournament.slug}/standings`;

  return {
    title,
    description: `Live standings and points table for ${tournament.name}.`,
    alternates: { canonical: url },
    openGraph: { title, url, type: "website" },
  };
}

export default async function TournamentStandings({
  params,
  searchParams,
}: {
  params: Promise<{ game: string; slug: string }>;
  searchParams: Promise<{ phase?: string }>;
}) {
  const { game: gameSlug, slug } = await params;
  const { phase: rawPhase } = await searchParams;
  const tournament = await getTournamentBySlug(slug);
  if (!tournament || tournament.game.slug !== gameSlug) notFound();

  const isBR = tournament.game.formatType === "BR";
  const pointsPerKill = tournament.pointsSystem?.pointsPerKill ?? 1;
  const stages = tournament.stages;
  const leagueStages = stages.length > 0 ? stages.slice(0, -1) : [];

  // League has anywhere from a couple of rounds to five-plus (Qualifiers,
  // Wildcard, Survival Stage, ...), fully admin-named — so default to
  // whichever phase is actually live, falling back to the most recent one,
  // rather than always landing on phase 1.
  const activePhaseId = (() => {
    if (leagueStages.some((s) => s.id === rawPhase)) return rawPhase as string;
    const ongoing = leagueStages.find((s) => stageStatus(s) === "ONGOING");
    if (ongoing) return ongoing.id;
    const upcoming = leagueStages.find((s) => stageStatus(s) === "UPCOMING");
    if (upcoming) return upcoming.id;
    return leagueStages[leagueStages.length - 1]?.id;
  })();
  const activeLeagueStage = leagueStages.find((s) => s.id === activePhaseId) ?? null;

  const groupedStandings = new Map<string, typeof tournament.groupStandingsRows>();
  for (const row of tournament.groupStandingsRows) {
    const list = groupedStandings.get(row.groupName) ?? [];
    list.push(row);
    groupedStandings.set(row.groupName, list);
  }

  const url = `${SITE_URL}/tournament/${tournament.game.slug}/${tournament.slug}/standings`;
  const jsonLd = jsonLdGraph(
    buildBreadcrumbJsonLd([
      { name: "Home", url: SITE_URL },
      { name: "Tournaments", url: `${SITE_URL}/tournament` },
      { name: tournament.game.name, url: `${SITE_URL}/tournament/${tournament.game.slug}` },
      { name: tournament.name, url: `${SITE_URL}/tournament/${tournament.game.slug}/${tournament.slug}` },
      { name: "Standings", url },
    ]),
  );

  return (
    <div className="space-y-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <h1 className="sr-only">{tournament.name} Standings</h1>

      {leagueStages.length === 0 ? (
        <p className="text-sm text-zinc-400">
          No league rounds — this tournament goes straight to Grand Finals.
        </p>
      ) : (
        <>
          <nav className="flex flex-wrap gap-2">
            {leagueStages.map((stage) => {
              const st = stageStatus(stage);
              const active = stage.id === activePhaseId;
              return (
                <Link
                  key={stage.id}
                  href={`/tournament/${gameSlug}/${slug}/standings?phase=${stage.id}`}
                  className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                    active
                      ? "bg-blue-600 text-white"
                      : "border border-zinc-200 text-zinc-500 hover:border-blue-300 hover:text-blue-700"
                  }`}
                >
                  {stage.name}
                  {st === "ONGOING" && (
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${
                        active ? "bg-white/20 text-white" : "bg-blue-600 text-white"
                      }`}
                    >
                      LIVE
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
          {activeLeagueStage && (
            <StageSection
              stage={activeLeagueStage}
              isBR={isBR}
              pointsPerKill={pointsPerKill}
              groupedStandings={groupedStandings}
            />
          )}
        </>
      )}
    </div>
  );
}
