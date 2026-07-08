import Link from "next/link";
import { GAMES_CATALOG, type GameCatalogEntry } from "@/lib/games-catalog";

type CarouselGame = Pick<GameCatalogEntry, "slug" | "name" | "tag" | "image" | "live">;

const GAMES: CarouselGame[] = GAMES_CATALOG;

// One half of the track; it is rendered twice and the CSS animation slides by
// exactly -50%, so the loop point is invisible. Three repeats keep a single
// half wider than any common viewport so no blank edge ever shows.
const HALF = [...GAMES, ...GAMES, ...GAMES];

export function GameCarousel() {
  return (
    <div className="relative">
      <div className="overflow-hidden py-8">
        {/* Pure CSS transform, running on the compositor: constant speed,
            uniform card size and gap throughout, never pauses or resets. */}
        <ul className="marquee-track flex w-max">
          {[...HALF, ...HALF].map((game, i) => (
            <li key={`${game.slug}-${i}`} className="mr-5 w-56 shrink-0">
              <GameCard game={game} />
            </li>
          ))}
        </ul>
      </div>

      {/* Symmetric fade at both edges — identical widths, mirrored, so the
          row reads the same coming in from either side. */}
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-white to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-white to-transparent"
        aria-hidden
      />
    </div>
  );
}

function GameCard({ game }: { game: CarouselGame }) {
  const inner = (
    <>
      <img
        src={game.image}
        alt={game.name}
        draggable={false}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
      />
      <div
        className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black/85 via-black/30 to-transparent"
        aria-hidden
      />

      {game.live ? (
        <span className="absolute top-2.5 right-2.5 flex items-center gap-1.5 rounded-full bg-blue-600 px-2.5 py-1 text-[10px] font-bold tracking-wider text-white shadow-md">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-300" />
          LIVE
        </span>
      ) : (
        <span className="absolute top-2.5 right-2.5 rounded-full border border-white/25 bg-black/45 px-2.5 py-1 text-[10px] font-semibold tracking-wider text-white/90">
          COMING SOON
        </span>
      )}

      <div className="absolute inset-x-0 bottom-0 p-3">
        <div className="flex items-center justify-between rounded-lg border border-white/25 bg-black/35 px-3 py-2 transition-colors group-hover:border-white/45 group-hover:bg-black/55">
          <span className="text-[13px] font-bold text-white drop-shadow">
            {game.name}
          </span>
          <span className="text-sm text-white transition-transform duration-300 group-hover:translate-x-1">
            →
          </span>
        </div>
        <p className="mt-1.5 text-center text-[9px] font-semibold tracking-[0.2em] text-white/85 uppercase">
          {game.tag}
        </p>
      </div>
    </>
  );

  const className =
    "group relative block h-72 overflow-hidden rounded-2xl bg-zinc-900 shadow-[0_16px_36px_-16px_rgba(30,64,175,0.4)] ring-1 ring-black/10 transition-shadow duration-300 hover:shadow-[0_24px_50px_-16px_rgba(37,99,235,0.55)]";

  return game.live ? (
    <Link href={`/${game.slug}`} className={className} draggable={false}>
      {inner}
    </Link>
  ) : (
    <div className={className}>{inner}</div>
  );
}
