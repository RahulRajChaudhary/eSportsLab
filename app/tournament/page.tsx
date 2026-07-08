import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { TournamentCard, type TournamentCardData } from "@/components/tournament-card";
import { TournamentSearchFilter } from "@/components/tournament-search-filter";
import { GameFilterSidebar } from "@/components/game-filter-sidebar";
import { GAMES_CATALOG } from "@/lib/games-catalog";
import { formatCompactINR } from "@/lib/format";
import { SITE_URL, buildBreadcrumbJsonLd, buildItemListJsonLd, jsonLdGraph } from "@/lib/seo";

export const revalidate = 60;

const STATUS_FILTERS = [
  { key: "all", label: "All", value: null },
  { key: "live", label: "Live", value: "ONGOING" },
  { key: "upcoming", label: "Upcoming", value: "UPCOMING" },
  { key: "completed", label: "Completed", value: "COMPLETED" },
] as const;

const STATUS_SECTIONS = [
  { value: "ONGOING", heading: "Live Now" },
  { value: "UPCOMING", heading: "Upcoming" },
  { value: "COMPLETED", heading: "Completed" },
] as const;

function buildPageUrl(status: string, game: string) {
  const params = new URLSearchParams();
  if (status !== "all") params.set("status", status);
  if (game !== "all") params.set("game", game);
  const qs = params.toString();
  return `/tournament${qs ? `?${qs}` : ""}`;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; game?: string }>;
}): Promise<Metadata> {
  const { status: rawStatus, game: rawGame } = await searchParams;
  const status = (rawStatus ?? "all") as string;
  const game = rawGame ?? "all";

  const title = "Esports Tournaments — BGMI & Valorant Schedules, Standings, Results | EsportsLab";
  const description =
    "Browse live, upcoming, and completed esports tournaments for BGMI and Valorant — schedules, standings, prize pools, and results, verified against official sources.";
  const url = `${SITE_URL}${buildPageUrl(status, game)}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: "website" },
  };
}

export default async function TournamentIndex({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; game?: string }>;
}) {
  const { status: rawStatus, game: rawGame } = await searchParams;
  const liveGames = GAMES_CATALOG.filter((g) => g.live);
  const liveSlugs = liveGames.map((g) => g.slug);
  const comingSoonGames = GAMES_CATALOG.filter((g) => !g.live);

  const statusFilter = STATUS_FILTERS.find((s) => s.key === rawStatus) ?? STATUS_FILTERS[0];
  const gameFilter = liveSlugs.includes(rawGame ?? "") ? (rawGame as string) : "all";

  // Fetched unfiltered (all live-game tournaments) so the sidebar counts and
  // hero stats reflect sitewide totals, independent of the status/game
  // filters applied to the list below.
  const allTournaments = await prisma.tournament.findMany({
    where: { game: { slug: { in: liveSlugs } } },
    include: { game: true, _count: { select: { participants: true } } },
    orderBy: [{ startDate: "desc" }],
  });

  const tournamentCountBySlug = new Map<string, number>();
  for (const t of allTournaments) {
    tournamentCountBySlug.set(t.game.slug, (tournamentCountBySlug.get(t.game.slug) ?? 0) + 1);
  }

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const stats = {
    live: allTournaments.filter((t) => t.status === "ONGOING").length,
    thisMonth: allTournaments.filter((t) => t.startDate && t.startDate >= monthStart && t.startDate < monthEnd).length,
    totalPrize: allTournaments.reduce((sum, t) => sum + (t.prizePool ?? 0), 0),
    gamesTracked: new Set(allTournaments.map((t) => t.game.slug)).size,
  };

  const toCardData = (t: (typeof allTournaments)[number]): TournamentCardData => ({
    slug: t.slug,
    name: t.name,
    tier: t.tier,
    region: t.region,
    status: t.status,
    startDate: t.startDate,
    endDate: t.endDate,
    prizePool: t.prizePool,
    game: { slug: t.game.slug, name: t.game.name, logoUrl: t.game.logoUrl },
    participantCount: t._count.participants,
  });

  const filtered = allTournaments.filter(
    (t) =>
      (gameFilter === "all" || t.game.slug === gameFilter) &&
      (!statusFilter.value || t.status === statusFilter.value),
  );

  // ONGOING newest-first, UPCOMING soonest-first, COMPLETED most-recent-first
  // — grouped sections below need each group internally consistent even
  // though the base query is a single `orderBy: startDate desc`.
  function sortGroup(items: typeof filtered, status: string) {
    return items
      .filter((t) => t.status === status)
      .slice()
      .sort((a, b) =>
        status === "UPCOMING"
          ? (a.startDate?.getTime() ?? Infinity) - (b.startDate?.getTime() ?? Infinity)
          : (b.startDate?.getTime() ?? 0) - (a.startDate?.getTime() ?? 0),
      );
  }

  const sections = STATUS_SECTIONS.map((s) => ({
    ...s,
    tournaments: sortGroup(filtered, s.value).map(toCardData),
  })).filter((s) => s.tournaments.length > 0);

  const allCardData = sections.flatMap((s) => s.tournaments);

  const pageUrl = `${SITE_URL}${buildPageUrl(statusFilter.key, gameFilter)}`;
  const jsonLd = jsonLdGraph(
    {
      "@type": "CollectionPage",
      "@id": `${SITE_URL}/tournament#page`,
      name: "Esports Tournaments",
      description: "Live, upcoming, and completed esports tournaments for BGMI and Valorant.",
      url: pageUrl,
      publisher: { "@type": "Organization", name: "EsportsLab", url: SITE_URL },
    },
    buildItemListJsonLd(
      "Esports Tournaments",
      pageUrl,
      allCardData.map((t) => ({
        name: t.name,
        url: `${SITE_URL}/tournament/${t.game.slug}/${t.slug}`,
      })),
    ),
    buildBreadcrumbJsonLd([
      { name: "Home", url: SITE_URL },
      { name: "Tournaments", url: `${SITE_URL}/tournament` },
    ]),
  );

  return (
    <div className="flex flex-1 flex-col text-zinc-900">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />

      <section className="border-b border-zinc-100">
        <div className="mx-auto max-w-6xl px-6 pt-12 pb-8">
          <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1 text-xs text-zinc-400">
            <Link href="/" className="hover:text-blue-700 hover:underline">
              Home
            </Link>
            <span aria-hidden>/</span>
            <span className="text-zinc-600">Tournaments</span>
          </nav>

          <div className="flex flex-wrap items-start justify-between gap-8">
            <div>
              <h1 className="text-3xl leading-tight font-extrabold tracking-tight sm:text-4xl">
                <span className="inline-block rounded-md bg-blue-50 px-2 text-zinc-900">Esports</span>
                <br />
                <span className="mt-1 inline-block rounded-md bg-blue-600 px-2 text-white">Tournaments</span>
              </h1>
              <p className="mt-4 max-w-sm text-zinc-600">
                Live, upcoming, and completed tournaments — schedules, standings, and results
                verified against official sources.
              </p>
            </div>

            <div className="flex divide-x divide-zinc-100 overflow-hidden rounded-2xl border border-zinc-100 bg-zinc-50/60">
              {[
                { label: "Live Now", value: stats.live, accent: "text-blue-600" },
                { label: "This Month", value: stats.thisMonth, accent: "text-zinc-900" },
                { label: "Total Prizes", value: formatCompactINR(stats.totalPrize), accent: "text-blue-600" },
                { label: "Games", value: stats.gamesTracked, accent: "text-zinc-900" },
              ].map((tile) => (
                <div key={tile.label} className="px-6 py-4 text-center">
                  <p className={`text-2xl font-extrabold ${tile.accent}`}>{tile.value}</p>
                  <p className="mt-1 text-[10px] font-bold tracking-wide text-zinc-400 uppercase">
                    {tile.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 inline-flex rounded-full border border-zinc-200 bg-zinc-50/60 p-1">
            {STATUS_FILTERS.map((s) => {
              const active = s.key === statusFilter.key;
              return (
                <Link
                  key={s.key}
                  href={buildPageUrl(s.key, gameFilter)}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                    active ? "bg-blue-600 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-800"
                  }`}
                >
                  {s.label}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
          <aside className="lg:sticky lg:top-20 lg:self-start">
            <GameFilterSidebar
              liveGames={liveGames}
              comingSoonGames={comingSoonGames}
              tournamentCountBySlug={tournamentCountBySlug}
              activeSlug={gameFilter}
              buildUrl={(slug) => buildPageUrl(statusFilter.key, slug)}
            />
          </aside>

          <div className="min-w-0">
            <TournamentSearchFilter>
              {allCardData.length === 0 ? (
                <p className="text-sm text-zinc-400">No tournaments match these filters.</p>
              ) : statusFilter.key === "all" ? (
                <div className="space-y-10">
                  {sections.map((section) => (
                    <section key={section.value}>
                      <div className="mb-3 flex items-center gap-2">
                        {section.value === "ONGOING" && (
                          <span className="flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold tracking-wide text-blue-700 uppercase">
                            <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                            Live Now
                          </span>
                        )}
                        {section.value !== "ONGOING" && (
                          <h2 className="text-xs font-bold tracking-wide text-zinc-400 uppercase">
                            {section.heading}
                          </h2>
                        )}
                        <span className="text-xs text-zinc-300">
                          {section.tournaments.length} tournament{section.tournaments.length === 1 ? "" : "s"}
                        </span>
                      </div>
                      <div className="space-y-3">
                        {section.tournaments.map((t) => (
                          <TournamentCard key={t.slug} tournament={t} now={now.getTime()} />
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {allCardData.map((t) => (
                    <TournamentCard key={t.slug} tournament={t} now={now.getTime()} />
                  ))}
                </div>
              )}
            </TournamentSearchFilter>
          </div>
        </div>
      </main>
    </div>
  );
}
