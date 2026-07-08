// Static per-game facts (not DB-backed — these don't change per tournament)
// shared by the landing-page carousel and the /tournament game picker.
// `live` mirrors whether the game has its own hub/data in this app yet;
// non-live entries render as "Coming Soon" rather than a dead link.
//
// Deliberately normalized to one release date + short platform tags (not
// every platform's individual release date) so every card renders the same
// number of rows — a per-platform date list makes some cards taller than
// others depending on how many platforms that game shipped on.
export type GameCatalogEntry = {
  slug: string;
  name: string;
  tag: string;
  image: string;
  live: boolean;
  developer: string;
  publisher: string;
  released: string;
  platforms: string[];
};

export const GAMES_CATALOG: GameCatalogEntry[] = [
  {
    slug: "bgmi",
    name: "BGMI",
    tag: "Battle Royale",
    image: "/games/bgmi.jpg",
    live: true,
    developer: "KRAFTON",
    publisher: "KRAFTON",
    released: "Jul 2021",
    platforms: ["Android", "iOS"],
  },
  {
    slug: "valorant",
    name: "Valorant",
    tag: "Tactical FPS",
    image: "/games/valorant.webp",
    live: false,
    developer: "Riot Games",
    publisher: "Riot Games",
    released: "Jun 2020",
    platforms: ["PC", "PS5", "Xbox"],
  },
  {
    slug: "free-fire",
    name: "Free Fire",
    tag: "Battle Royale",
    image: "/games/free-fire.jpg",
    live: false,
    developer: "111dots Studio",
    publisher: "Garena",
    released: "Dec 2017",
    platforms: ["Android", "iOS"],
  },
  {
    slug: "mlbb",
    name: "Mobile Legends",
    tag: "MOBA · 5v5",
    image: "/games/mlbb.png",
    live: false,
    developer: "Moonton",
    publisher: "Moonton",
    released: "Jul 2016",
    platforms: ["Android", "iOS"],
  },
  {
    slug: "pokemon-unite",
    name: "Pokémon Unite",
    tag: "MOBA",
    image: "/games/pokemon-unite.jpg",
    live: false,
    developer: "TiMi Studio Group",
    publisher: "The Pokémon Company",
    released: "Jul 2021",
    platforms: ["Switch", "Android", "iOS"],
  },
];
