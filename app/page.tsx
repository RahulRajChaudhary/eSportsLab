import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getBRStandings } from "@/lib/br-standings";
import { formatDateRange } from "@/lib/format";
import { GameCarousel } from "@/components/game-carousel";
import { ContributeModal } from "@/components/contribute-modal";

// Regenerate every 60s — most traffic should hit this cached HTML, not the DB.
export const revalidate = 60;

export default async function Home() {
  const bgmi = await prisma.game.findUnique({
    where: { slug: "bgmi" },
    include: {
      _count: { select: { tournaments: true, teams: true, players: true } },
    },
  });

  const [latestNews, matchCount, featured] = await Promise.all([
    bgmi
      ? prisma.newsPost.findMany({
          where: { gameId: bgmi.id },
          orderBy: { publishedAt: "desc" },
          take: 3,
        })
      : Promise.resolve([]),
    prisma.bRMatch.count(),
    bgmi
      ? prisma.tournament.findFirst({
          where: { gameId: bgmi.id },
          orderBy: [{ startDate: "desc" }],
        })
      : Promise.resolve(null),
  ]);

  // Prefer a running event for the "happening now" spotlight.
  const spotlight = bgmi
    ? ((await prisma.tournament.findFirst({
        where: { gameId: bgmi.id, status: "ONGOING" },
      })) ?? featured)
    : null;
  const spotlightStandings = spotlight
    ? (await getBRStandings(spotlight.id)).slice(0, 5)
    : [];

  const stats = [
    { value: bgmi?._count.tournaments ?? 0, label: "Tournaments tracked" },
    { value: bgmi?._count.teams ?? 0, label: "Teams profiled" },
    { value: bgmi?._count.players ?? 0, label: "Players indexed" },
    { value: matchCount, label: "Matches recorded" },
  ];

  return (
    <div className="flex flex-1 flex-col text-zinc-900">
      <main className="flex-1">
        {/* Hero sits on the sitewide box-grid backdrop */}
        <section className="relative">
          {/* Decorative accent boxes on the grid */}
          <div
            className="absolute top-6 left-[8%] hidden h-11 w-11 rounded-md border border-blue-200 bg-blue-50/60 md:block"
            aria-hidden
          />
          <div
            className="absolute top-20 right-[12%] hidden h-11 w-11 rounded-md border border-blue-300 bg-blue-100/50 md:block"
            aria-hidden
          />
          <div
            className="absolute top-36 left-[18%] hidden h-6 w-6 rounded border border-cyan-200 bg-cyan-50/60 md:block"
            aria-hidden
          />

          <div className="relative mx-auto max-w-6xl px-6 pt-6 pb-4 text-center sm:pt-8">
            <span className="animate-fade-up inline-block rounded-full border border-blue-200 bg-blue-50 px-4 py-1 text-xs font-semibold text-blue-700">
              The home of Indian esports data
            </span>
            <h1
              className="animate-fade-up mx-auto mt-4 max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl"
              style={{ animationDelay: "80ms" }}
            >
              Every match. Every team.{" "}
              <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 bg-clip-text text-transparent">
                Verified.
              </span>
            </h1>
            <p
              className="animate-fade-up mx-auto mt-3 max-w-xl text-lg text-zinc-600"
              style={{ animationDelay: "160ms" }}
            >
              Standings, brackets, and player careers for the Indian grind —
              crowd-sourced, source-linked, checked before it goes live.
            </p>

            {/* Search */}
            <div
              className="animate-fade-up mx-auto mt-6 max-w-xl"
              style={{ animationDelay: "240ms" }}
            >
              <div className="flex items-center gap-2 rounded-full border border-zinc-200 bg-white p-2 pl-5 shadow-[0_8px_30px_-12px_rgba(37,99,235,0.3)] transition-colors focus-within:border-blue-400">
                <svg
                  className="h-5 w-5 shrink-0 text-zinc-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z"
                  />
                </svg>
                <input
                  type="search"
                  placeholder="Search teams, players, tournaments…"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-zinc-400"
                  aria-label="Search"
                />
                <button
                  type="button"
                  className="rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-2 text-sm font-semibold text-white transition-transform hover:scale-105"
                >
                  Search
                </button>
              </div>
              <p className="mt-2 text-xs text-zinc-400">
                Search launches with the full BGMI dataset
              </p>
            </div>

            {/* Primary paths in — don't leave visitors parked on the hero */}
            <div
              className="animate-fade-up mt-5 flex flex-wrap items-center justify-center gap-3"
              style={{ animationDelay: "320ms" }}
            >
              <Link
                href="/bgmi"
                className="rounded-full bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_-8px_rgba(37,99,235,0.6)] transition-all hover:-translate-y-0.5 hover:bg-blue-700"
              >
                Explore BGMI →
              </Link>
              <a
                href="#how"
                className="rounded-full border border-zinc-200 bg-white px-6 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:border-blue-300 hover:text-blue-700"
              >
                How verification works
              </a>
              <ContributeModal />
            </div>
          </div>
        </section>

        {/* Game carousel — sits inside the fold, right under the hero */}
        <section className="overflow-hidden border-y border-zinc-100 bg-gradient-to-b from-white to-blue-50/40 py-6">
          <GameCarousel />
        </section>

        {/* Happening now — the live reason to stick around */}
        {spotlight && (
          <section className="mx-auto max-w-6xl px-6 py-12">
            <div className="overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-[0_16px_50px_-24px_rgba(37,99,235,0.35)]">
              <div className="grid md:grid-cols-2">
                <div className="flex flex-col justify-center p-8">
                  <span className="inline-flex w-fit items-center gap-2 rounded-full bg-blue-600 px-3 py-1 text-xs font-bold text-white">
                    {spotlight.status === "ONGOING" && (
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-300" />
                    )}
                    {spotlight.status === "ONGOING"
                      ? "HAPPENING NOW"
                      : spotlight.status === "UPCOMING"
                        ? "UP NEXT"
                        : "LATEST EVENT"}
                  </span>
                  <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
                    {spotlight.name}
                  </h2>
                  <p className="mt-2 text-sm text-zinc-500">
                    {[
                      spotlight.tier,
                      spotlight.region,
                      formatDateRange(spotlight.startDate, spotlight.endDate),
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link
                      href={`/tournament/bgmi/${spotlight.slug}`}
                      className="rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                    >
                      Full standings →
                    </Link>
                    <Link
                      href="/bgmi"
                      className="rounded-full border border-zinc-200 px-5 py-2 text-sm font-semibold text-zinc-700 transition-colors hover:border-blue-300 hover:text-blue-700"
                    >
                      All BGMI events
                    </Link>
                  </div>
                </div>

                <div className="border-t border-blue-50 bg-blue-50/40 p-8 md:border-t-0 md:border-l">
                  <h3 className="text-xs font-semibold tracking-wide text-zinc-400 uppercase">
                    Top 5 · Overall points
                  </h3>
                  {spotlightStandings.length > 0 ? (
                    <ol className="mt-4 space-y-2">
                      {spotlightStandings.map((row, i) => (
                        <li
                          key={row.teamId}
                          className="flex items-center justify-between rounded-xl border border-blue-100/60 bg-white px-4 py-2.5 text-sm shadow-sm"
                        >
                          <span className="flex items-center gap-3">
                            <span
                              className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold ${
                                i === 0
                                  ? "bg-blue-600 text-white"
                                  : "bg-blue-50 text-blue-700"
                              }`}
                            >
                              {i + 1}
                            </span>
                            <span className="font-medium">{row.teamName}</span>
                          </span>
                          <span className="font-bold text-blue-700">
                            {row.points} pts
                          </span>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p className="mt-4 text-sm text-zinc-400">
                      Standings go live with the first match.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Stats strip */}
        <section className="mx-auto max-w-6xl px-6 pb-10">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {stats.map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border border-zinc-100 bg-white p-6 text-center shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <p className="text-3xl font-bold text-blue-600">{s.value}</p>
                <p className="mt-1 text-sm text-zinc-500">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="bg-gradient-to-b from-blue-50/40 to-white py-12">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
              Wiki-grade accuracy, community speed
            </h2>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {[
                {
                  step: "01",
                  title: "Community submits",
                  body: "Anyone can submit results, rosters, and tournaments — every submission requires a source link (VOD, screenshot, or official post).",
                },
                {
                  step: "02",
                  title: "Editors verify",
                  body: "Trusted editors review each submission against its source before anything goes live. No unverified data, ever.",
                },
                {
                  step: "03",
                  title: "India-wide coverage",
                  body: "From official tiers to campus tournaments — the events global databases skip are exactly the ones we track.",
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm"
                >
                  <span className="text-sm font-bold text-blue-500">
                    {item.step}
                  </span>
                  <h3 className="mt-2 font-semibold text-zinc-900">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-500">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* News */}
        {latestNews.length > 0 && (
          <section id="news" className="mx-auto max-w-6xl px-6 py-12">
            <h2 className="mb-6 text-2xl font-bold tracking-tight">
              Latest news
            </h2>
            <ul className="grid gap-5 md:grid-cols-3">
              {latestNews.map((post) => (
                <li
                  key={post.id}
                  className="rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
                >
                  <p className="font-semibold text-zinc-900">{post.title}</p>
                  <p className="mt-2 text-sm leading-6 text-zinc-500">
                    {post.body}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </div>
  );
}
