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
  /** Set when the Grand Finals roster/standings on Liquipedia were partially
   * truncated by the fetch pipeline — recorded so it's visible in the admin
   * UI rather than silently passed off as complete. */
  incomplete?: string;
};

const tournaments: TournamentDef[] = [
  {
    slug: "bgmi-international-cup-2025",
    name: "BGMI International Cup 2025",
    tier: "A-Tier",
    region: "International",
    eventType: "LAN",
    series: "BGMI International Cup",
    season: "2025",
    startDate: "2025-10-31",
    endDate: "2025-11-02",
    prizePool: 10_000_000,
    prizePoolUsd: 112_644,
    organizer: "KRAFTON, Tesseract Esports",
    sourceLink: "https://liquipedia.net/pubgmobile/Battlegrounds_Mobile_India_International_Cup/2025",
    winner: "DRX",
    runnerUp: "True Rippers",
    teams: [
      { name: "Orangutan", region: "India" },
      { name: "K9 Esports", region: "India" },
      { name: "Team SouL", region: "India" },
      { name: "True Rippers", region: "India" },
      { name: "Nebula Esports", region: "India" },
      { name: "Madkings Esports", region: "India" },
      { name: "Gods Reign", region: "India" },
      { name: "MYSTERIOUS 4", region: "India" },
      { name: "DRX", region: "South Korea" },
      { name: "Nongshim RedForce", region: "South Korea" },
      { name: "Dplus", region: "South Korea" },
      { name: "Jecheon Phalanx", region: "South Korea" },
      { name: "CAG OSAKA", region: "Japan" },
      { name: "REJECT", region: "Japan" },
      { name: "REIGNITE", region: "Japan" },
      { name: "MAKING THE ROAD", region: "Japan" },
    ],
    prizeBreakdown: [
      { rank: "1st", amountInr: 3_000_000 },
      { rank: "2nd", amountInr: 1_500_000 },
      { rank: "3rd", amountInr: 1_000_000 },
      { rank: "4th", amountInr: 750_000 },
      { rank: "5th", amountInr: 625_000 },
      { rank: "6th", amountInr: 450_000 },
      { rank: "7th", amountInr: 375_000 },
      { rank: "8th", amountInr: 375_000 },
      { rank: "9th", amountInr: 250_000 },
      { rank: "10th", amountInr: 250_000 },
      { rank: "11th", amountInr: 200_000 },
      { rank: "12th", amountInr: 200_000 },
      { rank: "13th", amountInr: 150_000 },
      { rank: "14th", amountInr: 150_000 },
      { rank: "15th", amountInr: 125_000 },
      { rank: "16th", amountInr: 125_000 },
    ],
  },
  {
    slug: "bgmi-showdown-2025",
    name: "BGMI Showdown 2025",
    tier: "A-Tier",
    region: "India",
    eventType: "LAN",
    series: "BGMI Showdown",
    season: "2025",
    startDate: "2025-09-18",
    endDate: "2025-10-12",
    prizePool: 10_000_000,
    prizePoolUsd: 112_674,
    organizer: "KRAFTON, Tesseract Esports",
    sourceLink: "https://liquipedia.net/pubgmobile/Battlegrounds_Mobile_India_Showdown/2025",
    winner: "Orangutan",
    runnerUp: "K9 Esports",
    // Liquipedia's Grand Finals table (16 teams) got truncated by the fetch
    // pipeline past rank 5 on every retry — only ranks 1-5 are verified.
    // Remaining 11 Grand Finalists + their placements are NOT entered yet.
    incomplete: "Only ranks 1-5 of the 16-team Grand Finals confirmed — source page truncated past rank 5 on every fetch attempt.",
    teams: [
      { name: "Orangutan", region: "India" },
      { name: "K9 Esports", region: "India" },
      { name: "Team SouL", region: "India" },
      { name: "True Rippers", region: "India" },
      { name: "Nebula Esports", region: "India" },
    ],
    prizeBreakdown: [
      { rank: "1st", amountInr: 3_000_000 },
      { rank: "2nd", amountInr: 1_500_000 },
      { rank: "3rd", amountInr: 1_000_000 },
      { rank: "4th", amountInr: 750_000 },
      { rank: "5th", amountInr: 625_000 },
    ],
  },
  {
    slug: "bgmi-pro-series-2025",
    name: "BGMI Pro Series 2025",
    tier: "A-Tier",
    region: "India",
    eventType: "LAN",
    series: "BGMI Pro Series",
    season: "2025",
    startDate: "2025-06-14",
    endDate: "2025-07-06",
    prizePool: 40_000_000,
    prizePoolUsd: 466_191,
    organizer: "KRAFTON, NODWIN Gaming, Tesseract Esports",
    sourceLink: "https://liquipedia.net/pubgmobile/Battlegrounds_Mobile_India_Pro_Series/2025",
    winner: "Aryan x TMG Gaming",
    runnerUp: "NoNx Esports",
    teams: [
      { name: "Aryan x TMG Gaming", region: "India" },
      { name: "NoNx Esports", region: "India" },
      { name: "Los Hermanos Esports", region: "India" },
      { name: "4Merical Esports", region: "India" },
      { name: "8Bit", region: "India" },
      { name: "Gods Omen", region: "India" },
      { name: "4TR Official", region: "India" },
      { name: "TWOB", region: "India" },
      { name: "Gods Reign", region: "India" },
      { name: "K9 Esports", region: "India" },
      { name: "Team Forever", region: "India" },
      { name: "Inferno Squad", region: "India" },
      { name: "Genesis Esports", region: "India" },
      { name: "Team Eggy", region: "India" },
      { name: "TEAM iNSANE", region: "India" },
      { name: "2OP Official", region: "India" },
    ],
    prizeBreakdown: [
      { rank: "1st", amountInr: 12_500_000 },
      { rank: "2nd", amountInr: 5_500_000 },
      { rank: "3rd", amountInr: 3_500_000 },
      { rank: "4th", amountInr: 2_250_000 },
      { rank: "5th", amountInr: 1_800_000 },
      { rank: "6th", amountInr: 1_500_000 },
      { rank: "7th", amountInr: 1_400_000 },
      { rank: "8th", amountInr: 1_300_000 },
      { rank: "9th", amountInr: 1_200_000 },
      { rank: "10th", amountInr: 1_200_000 },
      { rank: "11th", amountInr: 800_000 },
      { rank: "12th", amountInr: 800_000 },
      { rank: "13th", amountInr: 700_000 },
      { rank: "14th", amountInr: 700_000 },
      { rank: "15th", amountInr: 700_000 },
      { rank: "16th", amountInr: 500_000 },
    ],
  },
  {
    slug: "bgmi-series-2025",
    name: "BGMI Series 2025",
    tier: "A-Tier",
    region: "India",
    eventType: "LAN",
    series: "BGMI Series",
    season: "2025",
    startDate: "2025-02-16",
    endDate: "2025-04-27",
    prizePool: 32_100_000,
    prizePoolUsd: 375_945,
    organizer: "KRAFTON, Tesseract Esports",
    sourceLink: "https://liquipedia.net/pubgmobile/Battlegrounds_Mobile_India_Series/2025",
    winner: "Team Versatile",
    runnerUp: "GodLike Esports",
    teams: [
      { name: "Team Versatile", region: "India" },
      { name: "GodLike Esports", region: "India" },
      { name: "Orangutan", region: "India" },
      { name: "Reckoning Esports", region: "India" },
      { name: "True Rippers", region: "India" },
      { name: "SOA Esports", region: "India" },
      { name: "Cincinnati Kids", region: "India" },
      { name: "Medal Esports", region: "India" },
      { name: "FS Esports", region: "India" },
      { name: "Bot Army", region: "India" },
      { name: "4EverxRedXRoss", region: "India" },
      { name: "Genesis Esports", region: "India" },
      { name: "Rivalry NRI", region: "India" },
      { name: "THWxNonx Esports", region: "India" },
      { name: "Team SouL", region: "India" },
      { name: "Hades H4K", region: "India" },
    ],
    prizeBreakdown: [
      { rank: "1st", amountInr: 6_960_000 },
      { rank: "2nd", amountInr: 3_720_000 },
      { rank: "3rd", amountInr: 2_600_000 },
      { rank: "4th", amountInr: 1_980_000 },
      { rank: "5th", amountInr: 1_670_000 },
      { rank: "6th", amountInr: 1_320_000 },
      { rank: "7th", amountInr: 1_110_000 },
      { rank: "8th", amountInr: 1_110_000 },
      { rank: "9th", amountInr: 860_000 },
      { rank: "10th", amountInr: 860_000 },
      { rank: "11th", amountInr: 760_000 },
      { rank: "12th", amountInr: 760_000 },
      { rank: "13th", amountInr: 660_000 },
      { rank: "14th", amountInr: 660_000 },
      { rank: "15th", amountInr: 610_000 },
      { rank: "16th", amountInr: 610_000 },
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
        gameId: bgmi.id,
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
        description: def.incomplete
          ? `<p><em>Import note: ${def.incomplete}</em></p>`
          : null,
      },
    });

    await prisma.tournamentTeam.createMany({
      data: teams.map((team) => ({ tournamentId: tournament.id, teamId: team.id })),
    });

    console.log(
      `Imported: ${def.name} — ${teams.length} teams${def.incomplete ? " (INCOMPLETE — see stage description)" : ""}`,
    );
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
