import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { slugify } from "../lib/slug";
import { computeBRPoints } from "../lib/br-standings";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set — check your .env file");
}

const prisma = new PrismaClient({ accelerateUrl: process.env.DATABASE_URL });

// Sourced from liquipedia.net's raw wikitext (api.php?action=parse&prop=wikitext&section=11
// on Battlegrounds_Mobile_India_Series/2026) — the rendered-HTML fetch truncated
// before reaching this data on every attempt, but the underlying wiki templates
// parsed cleanly. Each game's 16 placements were verified to form a 1-16
// permutation before use.
type Row = { team: string; placement: number; kills: number };
const games: { mapName: string; rows: Row[] }[] = [
  {
    mapName: "Rondo",
    rows: [
      { team: "orangutan", placement: 2, kills: 11 },
      { team: "genesis esports", placement: 14, kills: 3 },
      { team: "team soul", placement: 6, kills: 13 },
      { team: "learn from past", placement: 9, kills: 3 },
      { team: "reckoning esports", placement: 12, kills: 5 },
      { team: "rntx", placement: 3, kills: 16 },
      { team: "meta ninza", placement: 4, kills: 4 },
      { team: "victores sumus", placement: 5, kills: 10 },
      { team: "godl", placement: 13, kills: 6 },
      { team: "nebula esports", placement: 8, kills: 2 },
      { team: "wyld fangs", placement: 1, kills: 19 },
      { team: "myth official", placement: 16, kills: 1 },
      { team: "welt esports", placement: 11, kills: 1 },
      { team: "team tamilas", placement: 15, kills: 8 },
      { team: "k9 esports", placement: 7, kills: 1 },
      { team: "vasista esports", placement: 10, kills: 0 },
    ],
  },
  {
    mapName: "Erangel",
    rows: [
      { team: "orangutan", placement: 16, kills: 0 },
      { team: "genesis esports", placement: 4, kills: 8 },
      { team: "team soul", placement: 1, kills: 10 },
      { team: "learn from past", placement: 13, kills: 1 },
      { team: "reckoning esports", placement: 2, kills: 5 },
      { team: "rntx", placement: 14, kills: 2 },
      { team: "meta ninza", placement: 8, kills: 6 },
      { team: "victores sumus", placement: 10, kills: 4 },
      { team: "godl", placement: 7, kills: 6 },
      { team: "nebula esports", placement: 12, kills: 4 },
      { team: "wyld fangs", placement: 5, kills: 0 },
      { team: "myth official", placement: 6, kills: 3 },
      { team: "welt esports", placement: 15, kills: 2 },
      { team: "team tamilas", placement: 3, kills: 2 },
      { team: "k9 esports", placement: 11, kills: 0 },
      { team: "vasista esports", placement: 9, kills: 6 },
    ],
  },
  {
    mapName: "Erangel",
    rows: [
      { team: "orangutan", placement: 12, kills: 1 },
      { team: "genesis esports", placement: 9, kills: 7 },
      { team: "team soul", placement: 13, kills: 4 },
      { team: "learn from past", placement: 15, kills: 4 },
      { team: "reckoning esports", placement: 3, kills: 5 },
      { team: "rntx", placement: 11, kills: 6 },
      { team: "meta ninza", placement: 5, kills: 3 },
      { team: "victores sumus", placement: 14, kills: 2 },
      { team: "godl", placement: 1, kills: 10 },
      { team: "nebula esports", placement: 7, kills: 1 },
      { team: "wyld fangs", placement: 10, kills: 1 },
      { team: "myth official", placement: 2, kills: 4 },
      { team: "welt esports", placement: 6, kills: 6 },
      { team: "team tamilas", placement: 16, kills: 1 },
      { team: "k9 esports", placement: 4, kills: 1 },
      { team: "vasista esports", placement: 8, kills: 3 },
    ],
  },
  {
    mapName: "Erangel",
    rows: [
      { team: "orangutan", placement: 8, kills: 1 },
      { team: "genesis esports", placement: 6, kills: 17 },
      { team: "team soul", placement: 14, kills: 2 },
      { team: "learn from past", placement: 11, kills: 1 },
      { team: "reckoning esports", placement: 2, kills: 6 },
      { team: "rntx", placement: 9, kills: 0 },
      { team: "meta ninza", placement: 16, kills: 1 },
      { team: "victores sumus", placement: 4, kills: 7 },
      { team: "godl", placement: 10, kills: 3 },
      { team: "nebula esports", placement: 15, kills: 0 },
      { team: "wyld fangs", placement: 13, kills: 1 },
      { team: "myth official", placement: 7, kills: 2 },
      { team: "welt esports", placement: 3, kills: 2 },
      { team: "team tamilas", placement: 12, kills: 0 },
      { team: "k9 esports", placement: 5, kills: 5 },
      { team: "vasista esports", placement: 1, kills: 12 },
    ],
  },
  {
    mapName: "Miramar",
    rows: [
      { team: "orangutan", placement: 14, kills: 0 },
      { team: "genesis esports", placement: 4, kills: 9 },
      { team: "team soul", placement: 5, kills: 3 },
      { team: "learn from past", placement: 7, kills: 1 },
      { team: "reckoning esports", placement: 11, kills: 2 },
      { team: "rntx", placement: 16, kills: 2 },
      { team: "meta ninza", placement: 15, kills: 2 },
      { team: "victores sumus", placement: 2, kills: 8 },
      { team: "godl", placement: 1, kills: 13 },
      { team: "nebula esports", placement: 6, kills: 0 },
      { team: "wyld fangs", placement: 3, kills: 9 },
      { team: "myth official", placement: 10, kills: 3 },
      { team: "welt esports", placement: 8, kills: 1 },
      { team: "team tamilas", placement: 9, kills: 2 },
      { team: "k9 esports", placement: 13, kills: 4 },
      { team: "vasista esports", placement: 12, kills: 2 },
    ],
  },
  {
    mapName: "Miramar",
    rows: [
      { team: "orangutan", placement: 11, kills: 8 },
      { team: "genesis esports", placement: 14, kills: 0 },
      { team: "team soul", placement: 5, kills: 16 },
      { team: "learn from past", placement: 4, kills: 1 },
      { team: "reckoning esports", placement: 9, kills: 2 },
      { team: "rntx", placement: 8, kills: 3 },
      { team: "meta ninza", placement: 15, kills: 2 },
      { team: "victores sumus", placement: 1, kills: 3 },
      { team: "godl", placement: 13, kills: 4 },
      { team: "nebula esports", placement: 12, kills: 3 },
      { team: "wyld fangs", placement: 3, kills: 2 },
      { team: "myth official", placement: 7, kills: 1 },
      { team: "welt esports", placement: 16, kills: 1 },
      { team: "team tamilas", placement: 10, kills: 2 },
      { team: "k9 esports", placement: 6, kills: 3 },
      { team: "vasista esports", placement: 2, kills: 8 },
    ],
  },
  {
    mapName: "Rondo",
    rows: [
      { team: "orangutan", placement: 1, kills: 16 },
      { team: "genesis esports", placement: 7, kills: 6 },
      { team: "team soul", placement: 14, kills: 7 },
      { team: "learn from past", placement: 16, kills: 3 },
      { team: "reckoning esports", placement: 9, kills: 3 },
      { team: "rntx", placement: 12, kills: 11 },
      { team: "meta ninza", placement: 11, kills: 4 },
      { team: "victores sumus", placement: 2, kills: 10 },
      { team: "godl", placement: 8, kills: 2 },
      { team: "nebula esports", placement: 5, kills: 6 },
      { team: "wyld fangs", placement: 13, kills: 5 },
      { team: "myth official", placement: 3, kills: 9 },
      { team: "welt esports", placement: 4, kills: 7 },
      { team: "team tamilas", placement: 10, kills: 4 },
      { team: "k9 esports", placement: 15, kills: 0 },
      { team: "vasista esports", placement: 6, kills: 11 },
    ],
  },
  {
    mapName: "Erangel",
    rows: [
      { team: "orangutan", placement: 7, kills: 5 },
      { team: "genesis esports", placement: 3, kills: 15 },
      { team: "team soul", placement: 9, kills: 2 },
      { team: "learn from past", placement: 2, kills: 8 },
      { team: "reckoning esports", placement: 16, kills: 0 },
      { team: "rntx", placement: 8, kills: 6 },
      { team: "meta ninza", placement: 15, kills: 1 },
      { team: "victores sumus", placement: 6, kills: 5 },
      { team: "godl", placement: 10, kills: 3 },
      { team: "nebula esports", placement: 12, kills: 0 },
      { team: "wyld fangs", placement: 1, kills: 4 },
      { team: "myth official", placement: 13, kills: 0 },
      { team: "welt esports", placement: 11, kills: 1 },
      { team: "team tamilas", placement: 4, kills: 5 },
      { team: "k9 esports", placement: 5, kills: 4 },
      { team: "vasista esports", placement: 14, kills: 0 },
    ],
  },
  {
    mapName: "Erangel",
    rows: [
      { team: "orangutan", placement: 15, kills: 2 },
      { team: "genesis esports", placement: 5, kills: 7 },
      { team: "team soul", placement: 2, kills: 9 },
      { team: "learn from past", placement: 6, kills: 6 },
      { team: "reckoning esports", placement: 9, kills: 1 },
      { team: "rntx", placement: 8, kills: 0 },
      { team: "meta ninza", placement: 1, kills: 11 },
      { team: "victores sumus", placement: 10, kills: 3 },
      { team: "godl", placement: 3, kills: 13 },
      { team: "nebula esports", placement: 4, kills: 2 },
      { team: "wyld fangs", placement: 7, kills: 1 },
      { team: "myth official", placement: 16, kills: 1 },
      { team: "welt esports", placement: 14, kills: 0 },
      { team: "team tamilas", placement: 13, kills: 1 },
      { team: "k9 esports", placement: 12, kills: 0 },
      { team: "vasista esports", placement: 11, kills: 2 },
    ],
  },
  {
    mapName: "Erangel",
    rows: [
      { team: "orangutan", placement: 11, kills: 2 },
      { team: "genesis esports", placement: 15, kills: 4 },
      { team: "team soul", placement: 7, kills: 3 },
      { team: "learn from past", placement: 3, kills: 2 },
      { team: "reckoning esports", placement: 4, kills: 3 },
      { team: "rntx", placement: 2, kills: 15 },
      { team: "meta ninza", placement: 12, kills: 0 },
      { team: "victores sumus", placement: 9, kills: 1 },
      { team: "godl", placement: 8, kills: 4 },
      { team: "nebula esports", placement: 13, kills: 0 },
      { team: "wyld fangs", placement: 16, kills: 0 },
      { team: "myth official", placement: 5, kills: 5 },
      { team: "welt esports", placement: 14, kills: 1 },
      { team: "team tamilas", placement: 10, kills: 4 },
      { team: "k9 esports", placement: 1, kills: 14 },
      { team: "vasista esports", placement: 6, kills: 1 },
    ],
  },
  {
    mapName: "Miramar",
    rows: [
      { team: "orangutan", placement: 4, kills: 6 },
      { team: "genesis esports", placement: 2, kills: 3 },
      { team: "team soul", placement: 6, kills: 2 },
      { team: "learn from past", placement: 13, kills: 0 },
      { team: "reckoning esports", placement: 7, kills: 6 },
      { team: "rntx", placement: 8, kills: 1 },
      { team: "meta ninza", placement: 10, kills: 2 },
      { team: "victores sumus", placement: 14, kills: 1 },
      { team: "godl", placement: 9, kills: 4 },
      { team: "nebula esports", placement: 1, kills: 11 },
      { team: "wyld fangs", placement: 15, kills: 1 },
      { team: "myth official", placement: 5, kills: 10 },
      { team: "welt esports", placement: 16, kills: 1 },
      { team: "team tamilas", placement: 11, kills: 4 },
      { team: "k9 esports", placement: 12, kills: 0 },
      { team: "vasista esports", placement: 3, kills: 9 },
    ],
  },
  {
    mapName: "Miramar",
    rows: [
      { team: "orangutan", placement: 3, kills: 6 },
      { team: "genesis esports", placement: 8, kills: 9 },
      { team: "team soul", placement: 1, kills: 9 },
      { team: "learn from past", placement: 2, kills: 10 },
      { team: "reckoning esports", placement: 13, kills: 1 },
      { team: "rntx", placement: 11, kills: 1 },
      { team: "meta ninza", placement: 7, kills: 1 },
      { team: "victores sumus", placement: 15, kills: 0 },
      { team: "godl", placement: 9, kills: 0 },
      { team: "nebula esports", placement: 12, kills: 1 },
      { team: "wyld fangs", placement: 16, kills: 0 },
      { team: "myth official", placement: 10, kills: 4 },
      { team: "welt esports", placement: 6, kills: 4 },
      { team: "team tamilas", placement: 5, kills: 3 },
      { team: "k9 esports", placement: 14, kills: 5 },
      { team: "vasista esports", placement: 4, kills: 5 },
    ],
  },
  {
    mapName: "Rondo",
    rows: [
      { team: "orangutan", placement: 1, kills: 16 },
      { team: "genesis esports", placement: 10, kills: 6 },
      { team: "team soul", placement: 2, kills: 9 },
      { team: "learn from past", placement: 8, kills: 2 },
      { team: "reckoning esports", placement: 14, kills: 3 },
      { team: "rntx", placement: 4, kills: 7 },
      { team: "meta ninza", placement: 6, kills: 15 },
      { team: "victores sumus", placement: 16, kills: 1 },
      { team: "godl", placement: 11, kills: 9 },
      { team: "nebula esports", placement: 3, kills: 6 },
      { team: "wyld fangs", placement: 12, kills: 4 },
      { team: "myth official", placement: 13, kills: 7 },
      { team: "welt esports", placement: 9, kills: 1 },
      { team: "team tamilas", placement: 15, kills: 1 },
      { team: "k9 esports", placement: 5, kills: 9 },
      { team: "vasista esports", placement: 7, kills: 4 },
    ],
  },
  {
    mapName: "Erangel",
    rows: [
      { team: "orangutan", placement: 8, kills: 0 },
      { team: "genesis esports", placement: 1, kills: 6 },
      { team: "team soul", placement: 3, kills: 10 },
      { team: "learn from past", placement: 10, kills: 2 },
      { team: "reckoning esports", placement: 15, kills: 1 },
      { team: "rntx", placement: 6, kills: 2 },
      { team: "meta ninza", placement: 11, kills: 2 },
      { team: "victores sumus", placement: 4, kills: 6 },
      { team: "godl", placement: 12, kills: 4 },
      { team: "nebula esports", placement: 2, kills: 7 },
      { team: "wyld fangs", placement: 5, kills: 6 },
      { team: "myth official", placement: 16, kills: 0 },
      { team: "welt esports", placement: 14, kills: 4 },
      { team: "team tamilas", placement: 13, kills: 4 },
      { team: "k9 esports", placement: 7, kills: 8 },
      { team: "vasista esports", placement: 9, kills: 1 },
    ],
  },
  {
    mapName: "Erangel",
    rows: [
      { team: "orangutan", placement: 11, kills: 7 },
      { team: "genesis esports", placement: 15, kills: 2 },
      { team: "team soul", placement: 3, kills: 15 },
      { team: "learn from past", placement: 5, kills: 6 },
      { team: "reckoning esports", placement: 1, kills: 9 },
      { team: "rntx", placement: 13, kills: 0 },
      { team: "meta ninza", placement: 16, kills: 0 },
      { team: "victores sumus", placement: 6, kills: 0 },
      { team: "godl", placement: 14, kills: 0 },
      { team: "nebula esports", placement: 7, kills: 0 },
      { team: "wyld fangs", placement: 2, kills: 7 },
      { team: "myth official", placement: 9, kills: 0 },
      { team: "welt esports", placement: 10, kills: 6 },
      { team: "team tamilas", placement: 12, kills: 0 },
      { team: "k9 esports", placement: 8, kills: 9 },
      { team: "vasista esports", placement: 4, kills: 0 },
    ],
  },
  {
    mapName: "Erangel",
    rows: [
      { team: "orangutan", placement: 8, kills: 3 },
      { team: "genesis esports", placement: 1, kills: 13 },
      { team: "team soul", placement: 16, kills: 3 },
      { team: "learn from past", placement: 3, kills: 6 },
      { team: "reckoning esports", placement: 12, kills: 1 },
      { team: "rntx", placement: 2, kills: 5 },
      { team: "meta ninza", placement: 6, kills: 4 },
      { team: "victores sumus", placement: 7, kills: 4 },
      { team: "godl", placement: 13, kills: 3 },
      { team: "nebula esports", placement: 4, kills: 3 },
      { team: "wyld fangs", placement: 9, kills: 0 },
      { team: "myth official", placement: 14, kills: 2 },
      { team: "welt esports", placement: 15, kills: 5 },
      { team: "team tamilas", placement: 10, kills: 5 },
      { team: "k9 esports", placement: 5, kills: 3 },
      { team: "vasista esports", placement: 11, kills: 1 },
    ],
  },
  {
    mapName: "Miramar",
    rows: [
      { team: "orangutan", placement: 14, kills: 1 },
      { team: "genesis esports", placement: 15, kills: 2 },
      { team: "team soul", placement: 13, kills: 2 },
      { team: "learn from past", placement: 3, kills: 3 },
      { team: "reckoning esports", placement: 10, kills: 2 },
      { team: "rntx", placement: 7, kills: 3 },
      { team: "meta ninza", placement: 6, kills: 3 },
      { team: "victores sumus", placement: 8, kills: 2 },
      { team: "godl", placement: 11, kills: 1 },
      { team: "nebula esports", placement: 5, kills: 12 },
      { team: "wyld fangs", placement: 16, kills: 1 },
      { team: "myth official", placement: 2, kills: 5 },
      { team: "welt esports", placement: 12, kills: 5 },
      { team: "team tamilas", placement: 4, kills: 6 },
      { team: "k9 esports", placement: 1, kills: 10 },
      { team: "vasista esports", placement: 9, kills: 2 },
    ],
  },
  {
    mapName: "Miramar",
    rows: [
      { team: "orangutan", placement: 8, kills: 7 },
      { team: "genesis esports", placement: 5, kills: 3 },
      { team: "team soul", placement: 7, kills: 0 },
      { team: "learn from past", placement: 16, kills: 0 },
      { team: "reckoning esports", placement: 12, kills: 2 },
      { team: "rntx", placement: 6, kills: 4 },
      { team: "meta ninza", placement: 2, kills: 3 },
      { team: "victores sumus", placement: 1, kills: 12 },
      { team: "godl", placement: 13, kills: 5 },
      { team: "nebula esports", placement: 14, kills: 2 },
      { team: "wyld fangs", placement: 3, kills: 3 },
      { team: "myth official", placement: 9, kills: 6 },
      { team: "welt esports", placement: 15, kills: 0 },
      { team: "team tamilas", placement: 4, kills: 9 },
      { team: "k9 esports", placement: 10, kills: 0 },
      { team: "vasista esports", placement: 11, kills: 1 },
    ],
  },
];

// Raw wikitext team identifiers -> Team.slug (as created by
// scripts/import-liquipedia-bgmi-2026.ts's upsertTeam, i.e. slugify(realName)).
const TEAM_SLUG: Record<string, string> = {
  orangutan: "orangutan",
  "genesis esports": "genesis-esports",
  "team soul": "team-soul",
  "learn from past": "learn-from-past",
  "reckoning esports": "reckoning-esports",
  rntx: "revenant-xspark",
  "meta ninza": "meta-ninza",
  "victores sumus": "victores-sumus",
  godl: "godlike-esports",
  "nebula esports": "nebula-esports",
  "wyld fangs": "wyld-fangs",
  "myth official": "myth-official",
  "welt esports": "welt-esports",
  "team tamilas": "team-tamilas",
  "k9 esports": "k9-esports",
  "vasista esports": "vasista-esports",
};

async function main() {
  const tournament = await prisma.tournament.findUnique({
    where: { slug: "bgmi-series-2026" },
    include: { pointsSystem: true, stages: true },
  });
  if (!tournament) throw new Error("bgmi-series-2026 not found — run the tournament import first.");
  if (!tournament.pointsSystem) throw new Error("bgmi-series-2026 has no PointsSystem.");

  const existingMatches = await prisma.bRMatch.count({ where: { tournamentId: tournament.id } });
  if (existingMatches > 0) {
    console.log(`Skip — ${existingMatches} BRMatch rows already exist for bgmi-series-2026.`);
    return;
  }

  const stage = tournament.stages.find((s) => s.name === "Grand Finals");
  if (!stage) throw new Error('No "Grand Finals" stage found on bgmi-series-2026.');

  const placementPoints = tournament.pointsSystem.placementPointsJson as Record<string, number>;
  const pointsPerKill = tournament.pointsSystem.pointsPerKill;

  const teamBySlug = new Map(
    (await prisma.team.findMany({ where: { slug: { in: Object.values(TEAM_SLUG) } } })).map((t) => [t.slug, t]),
  );
  for (const slug of Object.values(TEAM_SLUG)) {
    if (!teamBySlug.has(slug)) throw new Error(`Team not found for slug "${slug}"`);
  }

  for (let i = 0; i < games.length; i++) {
    const game = games[i];
    if (game.rows.length !== 16) throw new Error(`Game ${i + 1} has ${game.rows.length} rows, expected 16`);
    const placements = game.rows.map((r) => r.placement).sort((a, b) => a - b);
    if (JSON.stringify(placements) !== JSON.stringify(Array.from({ length: 16 }, (_, k) => k + 1))) {
      throw new Error(`Game ${i + 1} placements aren't a 1-16 permutation: ${placements.join(",")}`);
    }

    const match = await prisma.bRMatch.create({
      data: {
        tournamentId: tournament.id,
        stageId: stage.id,
        matchNumber: i + 1,
        mapName: game.mapName,
      },
    });

    await prisma.bRMatchEntry.createMany({
      data: game.rows.map((r) => {
        const slug = TEAM_SLUG[r.team];
        const team = teamBySlug.get(slug)!;
        return {
          brMatchId: match.id,
          teamId: team.id,
          placement: r.placement,
          kills: r.kills,
          pointsEarned: computeBRPoints(placementPoints, r.placement, r.kills, pointsPerKill),
        };
      }),
    });

    console.log(`Game ${i + 1} (${game.mapName}) — 16 entries`);
  }

  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
