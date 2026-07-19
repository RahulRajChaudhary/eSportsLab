import "dotenv/config";
import { PrismaClient, Prisma } from "../app/generated/prisma/client";
import { slugify } from "../lib/slug";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set — check your .env file");
}

const prisma = new PrismaClient({ accelerateUrl: process.env.DATABASE_URL });

// Mirrors lib/actions/tournaments.ts's DEFAULT_PLACEMENT_POINTS — every BR
// tournament gets one so match-entry (added later, once real per-match data
// is sourced) has a sane points table instead of scoring everything 0.
const DEFAULT_PLACEMENT_POINTS: Record<string, number> = {
  "1": 10,
  "2": 6,
  "3": 5,
  "4": 4,
  "5": 3,
  "6": 2,
  "7": 1,
  "8": 1,
};

type TeamDef = { name: string; region: string };
type PrizeRow = { rank: string; amountInr: number };

type TournamentDef = {
  slug: string;
  name: string;
  tier: string;
  region: string;
  eventType: string;
  series: string;
  season: string;
  startDate: string;
  endDate: string;
  prizePool: number;
  prizePoolUsd: number;
  organizer: string;
  sourceLink: string;
  winner: string;
  runnerUp: string;
  teams: TeamDef[];
  prizeBreakdown: PrizeRow[];
};

const tournaments: TournamentDef[] = [
  {
    slug: "bgmi-pro-series-2024",
    name: "BGMI Pro Series 2024",
    tier: "A-Tier",
    region: "India",
    eventType: "LAN",
    series: "BGMI Pro Series",
    season: "2024",
    startDate: "2024-08-20",
    endDate: "2024-09-29",
    prizePool: 20_000_000,
    prizePoolUsd: 238_896,
    organizer: "KRAFTON, Skyesports, Tesseract Esports",
    sourceLink: "https://liquipedia.net/pubgmobile/Battlegrounds_Mobile_India_Pro_Series/2024",
    winner: "TeamXSpark",
    runnerUp: "Numen Esports",
    teams: [
      { name: "TeamXSpark", region: "India" },
      { name: "Numen Esports", region: "India" },
      { name: "GodLike Esports", region: "India" },
      { name: "TWOB", region: "India" },
      { name: "Reckoning Esports", region: "India" },
      { name: "Orangutan", region: "India" },
      { name: "Team Limra", region: "India" },
      { name: "Team Versatile", region: "India" },
      { name: "Phoenix Esports", region: "India" },
      { name: "Team Bliss", region: "India" },
      { name: "Inferno Squad", region: "India" },
      { name: "Hyderabad Hydras", region: "India" },
      { name: "Silly Esports", region: "India" },
      { name: "Medal Esports", region: "India" },
      { name: "8Bit", region: "India" },
      { name: "Ignite Gaming", region: "India" },
    ],
    prizeBreakdown: [
      { rank: "1st", amountInr: 7_500_000 },
      { rank: "2nd", amountInr: 3_000_000 },
      { rank: "3rd", amountInr: 2_000_000 },
      { rank: "4th", amountInr: 1_250_000 },
      { rank: "5th", amountInr: 1_000_000 },
      { rank: "6th", amountInr: 800_000 },
      { rank: "7th", amountInr: 700_000 },
      { rank: "8th", amountInr: 600_000 },
      { rank: "9th", amountInr: 500_000 },
      { rank: "10th", amountInr: 500_000 },
      { rank: "11th", amountInr: 300_000 },
      { rank: "12th", amountInr: 300_000 },
      { rank: "13th", amountInr: 200_000 },
      { rank: "14th", amountInr: 200_000 },
      { rank: "15th", amountInr: 200_000 },
      { rank: "16th", amountInr: 200_000 },
    ],
  },
  {
    slug: "bgmi-series-2024",
    name: "BGMI Series 2024",
    tier: "A-Tier",
    region: "India",
    eventType: "LAN",
    series: "BGMI Series",
    season: "2024",
    startDate: "2024-05-02",
    endDate: "2024-06-30",
    prizePool: 20_000_000,
    prizePoolUsd: 239_911,
    organizer: "KRAFTON, Tesseract Esports",
    sourceLink: "https://liquipedia.net/pubgmobile/Battlegrounds_Mobile_India_Series/2024",
    winner: "TeamXSpark",
    runnerUp: "Global Esports",
    teams: [
      { name: "TeamXSpark", region: "India" },
      { name: "Global Esports", region: "India" },
      { name: "Reckoning Esports", region: "India" },
      { name: "Team SouL", region: "India" },
      { name: "Venom Gaming", region: "India" },
      { name: "Team Limra", region: "India" },
      { name: "8Bit", region: "India" },
      { name: "Team Tamilas", region: "India" },
      { name: "Raven Esports", region: "India" },
      { name: "FS Esports", region: "India" },
      { name: "TEAM iNSANE", region: "India" },
      { name: "Team Aaru", region: "India" },
      { name: "Vasista Esports", region: "India" },
      { name: "MOGO Esports", region: "India" },
      { name: "Carnival Gaming", region: "India" },
      { name: "Inferno Squad", region: "India" },
    ],
    prizeBreakdown: [
      { rank: "1st", amountInr: 6_000_000 },
      { rank: "2nd", amountInr: 3_000_000 },
      { rank: "3rd", amountInr: 2_000_000 },
      { rank: "4th", amountInr: 1_500_000 },
      { rank: "5th", amountInr: 1_250_000 },
      { rank: "6th", amountInr: 1_000_000 },
      { rank: "7th", amountInr: 900_000 },
      { rank: "8th", amountInr: 800_000 },
      { rank: "9th", amountInr: 600_000 },
      { rank: "10th", amountInr: 600_000 },
      { rank: "11th", amountInr: 400_000 },
      { rank: "12th", amountInr: 400_000 },
      { rank: "13th", amountInr: 250_000 },
      { rank: "14th", amountInr: 250_000 },
      { rank: "15th", amountInr: 250_000 },
      { rank: "16th", amountInr: 250_000 },
    ],
  },
];

async function upsertTeam(gameId: string, def: TeamDef) {
  const slug = slugify(def.name);
  const existing = await prisma.team.findUnique({ where: { slug } });
  if (existing) return existing;

  return prisma.team.create({
    data: { slug, name: def.name, gameId, region: def.region },
  });
}

async function main() {
  const bgmi = await prisma.game.findUnique({ where: { slug: "bgmi" } });
  if (!bgmi) throw new Error('Game "bgmi" not found — run prisma/seed.ts first.');
  const gameId = bgmi.id;

  const teamCache = new Map<string, Awaited<ReturnType<typeof upsertTeam>>>();
  async function getTeam(def: TeamDef) {
    const key = slugify(def.name);
    if (!teamCache.has(key)) teamCache.set(key, await upsertTeam(gameId, def));
    return teamCache.get(key)!;
  }

  for (const def of tournaments) {
    const existing = await prisma.tournament.findUnique({ where: { slug: def.slug } });
    if (existing) {
      console.log(`Skip (already imported): ${def.name}`);
      continue;
    }

    const teams = await Promise.all(def.teams.map(getTeam));
    const winner = teams.find((t) => t.name === def.winner);
    const runnerUp = teams.find((t) => t.name === def.runnerUp);

    const tournament = await prisma.tournament.create({
      data: {
        slug: def.slug,
        name: def.name,
        gameId,
        tier: def.tier,
        region: def.region,
        eventType: def.eventType,
        series: def.series,
        season: def.season,
        startDate: new Date(def.startDate),
        endDate: new Date(def.endDate),
        prizePool: def.prizePool,
        prizePoolUsd: def.prizePoolUsd,
        prizeBreakdownJson: def.prizeBreakdown as unknown as Prisma.InputJsonValue,
        organizer: def.organizer,
        sourceLink: def.sourceLink,
        status: "COMPLETED",
        winnerTeamId: winner?.id,
        runnerUpTeamId: runnerUp?.id,
      },
    });

    await prisma.pointsSystem.create({
      data: { tournamentId: tournament.id, placementPointsJson: DEFAULT_PLACEMENT_POINTS, pointsPerKill: 1 },
    });

    await prisma.stage.create({
      data: {
        tournamentId: tournament.id,
        name: "Grand Finals",
        order: 0,
        startDate: new Date(def.startDate),
        endDate: new Date(def.endDate),
      },
    });

    await prisma.tournamentTeam.createMany({
      data: teams.map((team) => ({ tournamentId: tournament.id, teamId: team.id })),
    });

    console.log(`Imported: ${def.name} — ${teams.length} teams`);
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
