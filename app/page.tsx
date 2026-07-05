import Link from "next/link";
import { prisma } from "@/lib/prisma";

// Regenerate every 60s — most traffic should hit this cached HTML, not the DB.
export const revalidate = 60;

// Brand palette pulled from the EL logo: chrome silver, electric royal blue,
// deep navy edges, cyan glow.
const games = [

  {
    slug: "bgmi",
    name: "BGMI",
    code: "BG",
    tag: "Battle Royale",
    gradient: "from-blue-600 to-indigo-700",
    live: true,
  },
  {
    slug: "valorant",
    name: "Valorant",
    code: "VAL",
    tag: "Tactical FPS",
    gradient: "from-sky-500 to-blue-700",
    live: false,
  },
  {
    slug: "free-fire",
    name: "Free Fire",
    code: "FF",
    tag: "Battle Royale",
    gradient: "from-indigo-500 to-blue-800",
    live: false,
  },
  {
    slug: "mlbb",
    name: "Mobile Legends",
    code: "ML",
    tag: "MOBA",
    gradient: "from-blue-500 to-cyan-600",
    live: false,
  },
  {
    slug: "wild-rift",
    name: "Wild Rift",
    code: "WR",
    tag: "MOBA",
    gradient: "from-cyan-500 to-blue-600",
    live: false,
  },
  {
    slug: "dota-2",
    name: "Dota 2",
    code: "D2",
    tag: "MOBA",
    gradient: "from-slate-600 to-blue-800",
    live: false,
  },
  {
    slug: "lol",
    name: "League of Legends",
    code: "LoL",
    tag: "MOBA",
    gradient: "from-blue-700 to-indigo-900",
    live: false,
  },
  {
    slug: "chess",
    name: "Chess",
    code: "♞",
    tag: "Mind Sport",
    gradient: "from-zinc-600 to-blue-900",
    live: false,
  },
];

function GameCard({
  game,
  stats,
}: {
  game: (typeof games)[number];
  stats?: string;
}) {
  const inner = (
    <>
      <div className="mb-4 flex items-center justify-between">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${game.gradient} text-sm font-bold text-white shadow-md shadow-blue-900/20`}
        >
          {game.code}
        </div>
        {game.live ? (
          <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white shadow-sm">
            Explore →
          </span>
        ) : (
          <span className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-400">
            Coming soon
          </span>
        )}
      </div>
      <h3 className="font-semibold text-zinc-900">{game.name}</h3>
      <p className="text-sm text-zinc-500">{game.tag}</p>
      {stats && <p className="mt-3 text-xs text-blue-700">{stats}</p>}
    </>
  );

  const className = `w-64 shrink-0 rounded-2xl border bg-white p-5 transition-all duration-300 ${
    game.live
      ? "border-blue-200 shadow-[0_4px_24px_-8px_rgba(37,99,235,0.25)] hover:-translate-y-1 hover:border-blue-400"
      : "border-zinc-200 opacity-75"
  }`;

  return game.live ? (
    <Link href={`/${game.slug}`} className={className}>
      {inner}
    </Link>
  ) : (
    <div className={className}>{inner}</div>
  );
}

export default async function Home() {
  const bgmi = await prisma.game.findUnique({
    where: { slug: "bgmi" },
    include: {
      _count: { select: { tournaments: true, teams: true, players: true } },
    },
  });

  const [latestNews, matchCount] = await Promise.all([
    bgmi
      ? prisma.newsPost.findMany({
          where: { gameId: bgmi.id },
          orderBy: { publishedAt: "desc" },
          take: 3,
        })
      : Promise.resolve([]),
    prisma.bRMatch.count(),
  ]);

  const bgmiStats = bgmi
    ? `${bgmi._count.tournaments} tournaments · ${bgmi._count.teams} teams · ${bgmi._count.players} players`
    : undefined;

  const stats = [
    { value: bgmi?._count.tournaments ?? 0, label: "Tournaments tracked" },
    { value: bgmi?._count.teams ?? 0, label: "Teams profiled" },
    { value: bgmi?._count.players ?? 0, label: "Players indexed" },
    { value: matchCount, label: "Matches recorded" },
  ];

  return (
    <div className="flex flex-1 flex-col bg-white text-zinc-900">
      <main className="flex-1">
        {/* Hero on box-grid pattern */}
        <section className="relative">
          <div className="bg-grid absolute inset-0" aria-hidden />
          {/* Decorative accent boxes on the grid */}
          <div
            className="absolute top-14 left-[8%] hidden h-11 w-11 rounded-md border border-blue-200 bg-blue-50/60 md:block"
            aria-hidden
          />
          <div
            className="absolute top-36 right-[12%] hidden h-11 w-11 rounded-md border border-blue-300 bg-blue-100/50 md:block"
            aria-hidden
          />
          <div
            className="absolute top-60 left-[18%] hidden h-6 w-6 rounded border border-cyan-200 bg-cyan-50/60 md:block"
            aria-hidden
          />

          <div className="relative mx-auto max-w-6xl px-6 pt-14 pb-12 text-center sm:pt-20">
            <span className="animate-fade-up inline-block rounded-full border border-blue-200 bg-blue-50 px-4 py-1 text-xs font-semibold text-blue-700">
              The home of Indian esports data 
            </span>
            <h1
              className="animate-fade-up mx-auto mt-5 max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl"
              style={{ animationDelay: "80ms" }}
            >
              Every match. Every team.{" "}
              <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 bg-clip-text text-transparent">
                Verified.
              </span>
            </h1>
            <p
              className="animate-fade-up mx-auto mt-4 max-w-xl text-lg text-zinc-600"
              style={{ animationDelay: "160ms" }}
            >
              Standings, brackets, and player careers for the Indian grind —
              crowd-sourced, source-linked, checked before it goes live.
            </p>

            {/* Search */}
            <div
              className="animate-fade-up mx-auto mt-8 max-w-xl"
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
          </div>
        </section>

        {/* Auto-scrolling game carousel */}
        <section className="border-y border-zinc-100 bg-gradient-to-b from-white to-blue-50/40 py-10">
          <div className="mx-auto mb-6 max-w-6xl px-6 text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              One lab, every title
            </h2>
            <p className="mx-auto mt-2 max-w-lg text-zinc-500">
              BGMI is live. The rest of the lineup is loading.
            </p>
          </div>
          <div className="marquee overflow-hidden">
            <div className="marquee-track gap-5 px-5">
              {[...games, ...games].map((game, i) => (
                <GameCard
                  key={`${game.slug}-${i}`}
                  game={game}
                  stats={game.live ? bgmiStats : undefined}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Stats strip */}
        <section className="mx-auto max-w-6xl px-6 py-10">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {stats.map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border border-zinc-100 bg-white p-6 text-center shadow-sm"
              >
                <p className="text-3xl font-bold text-blue-600">{s.value}</p>
                <p className="mt-1 text-sm text-zinc-500">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="bg-gradient-to-b from-blue-50/40 to-white py-12">
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
