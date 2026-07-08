import Image from "next/image";
import Link from "next/link";
import { GAMES_CATALOG, type GameCatalogEntry } from "@/lib/games-catalog";

const ACCENTS: Record<string, "bgmi" | "valorant" | "default"> = {
  bgmi: "bgmi",
  valorant: "valorant",
};

function accentFor(slug: string) {
  return ACCENTS[slug] ?? "default";
}

export function GameCard({
  game,
  tournamentCount,
}: {
  game: GameCatalogEntry;
  tournamentCount: number;
}) {
  const accent = accentFor(game.slug);
  const studio =
    game.developer === game.publisher ? game.developer : `${game.developer} · ${game.publisher}`;

  const content = (
    <>
      <div className="game-card-front">
        <div className="game-card-imgwrap">
          <Image src={game.image} alt={game.name} fill sizes="56px" />
        </div>
        <div>
          <p className="game-card-main">{game.name}</p>
          <p className="game-card-mainsub">
            {tournamentCount} {tournamentCount === 1 ? "tournament" : "tournaments"} tracked
          </p>
        </div>
      </div>

      <div className="game-card-back">
        <div className="game-card-info">
          <div className="game-card-info-row">
            <span className="game-card-info-label">Studio</span>
            <span className="game-card-info-value">{studio}</span>
          </div>
          <div className="game-card-info-row">
            <span className="game-card-info-label">Released</span>
            <span className="game-card-info-value">{game.released}</span>
          </div>
          <div className="game-card-platforms">
            {game.platforms.map((platform) => (
              <span key={platform} className="game-card-platform-chip">
                {platform}
              </span>
            ))}
          </div>
        </div>
        <div className="game-card-strip">
          {game.live ? "Live" : "Coming Soon"} · {game.tag}
        </div>
      </div>
    </>
  );

  const className = `game-card-outer game-card-${accent}`;

  return game.live ? (
    <Link href={`/tournament/${game.slug}`} className={className}>
      {content}
    </Link>
  ) : (
    <div className={className}>{content}</div>
  );
}

export { GAMES_CATALOG };
