import Link from "next/link";
import Image from "next/image";
import type { GameCatalogEntry } from "@/lib/games-catalog";

function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden>
      <path d="M12 2.5 15 9l7 .9-5.1 4.7L18.2 21 12 17.3 5.8 21l1.3-6.4L2 9.9 9 9z" />
    </svg>
  );
}

export function GameFilterSidebar({
  liveGames,
  comingSoonGames,
  tournamentCountBySlug,
  activeSlug,
  buildUrl,
}: {
  liveGames: GameCatalogEntry[];
  comingSoonGames: GameCatalogEntry[];
  tournamentCountBySlug: Map<string, number>;
  activeSlug: string;
  buildUrl: (gameSlug: string) => string;
}) {
  const totalCount = liveGames.reduce((sum, g) => sum + (tournamentCountBySlug.get(g.slug) ?? 0), 0);

  return (
    <nav aria-label="Filter by game" className="space-y-1">
      <Link
        href={buildUrl("all")}
        className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
          activeSlug === "all"
            ? "border border-zinc-200 bg-white text-zinc-900 shadow-sm"
            : "text-zinc-600 hover:bg-zinc-50"
        }`}
      >
        <StarIcon />
        <span className="flex-1">All Games</span>
        <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-bold text-zinc-500">
          {totalCount}
        </span>
      </Link>

      {liveGames.map((game) => {
        const active = activeSlug === game.slug;
        const count = tournamentCountBySlug.get(game.slug) ?? 0;
        return (
          <Link
            key={game.slug}
            href={buildUrl(game.slug)}
            className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
              active
                ? "border border-zinc-200 bg-white text-zinc-900 shadow-sm"
                : "text-zinc-600 hover:bg-zinc-50"
            }`}
          >
            <span className="relative h-5 w-5 shrink-0 overflow-hidden rounded-full">
              <Image src={game.image} alt="" fill sizes="20px" className="object-cover" />
            </span>
            <span className="flex-1">{game.name}</span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                active ? "bg-blue-600 text-white" : "bg-zinc-100 text-zinc-500"
              }`}
            >
              {count}
            </span>
          </Link>
        );
      })}

      {comingSoonGames.length > 0 && (
        <div className="pt-2">
          <p className="px-3 pb-1 text-[10px] font-bold tracking-wide text-zinc-300 uppercase">
            Coming soon
          </p>
          {comingSoonGames.map((game) => (
            <div
              key={game.slug}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-300"
            >
              <span className="relative h-5 w-5 shrink-0 overflow-hidden rounded-full opacity-50">
                <Image src={game.image} alt="" fill sizes="20px" className="object-cover" />
              </span>
              <span className="flex-1">{game.name}</span>
            </div>
          ))}
        </div>
      )}
    </nav>
  );
}
