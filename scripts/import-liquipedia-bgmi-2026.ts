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
  tier: string | null;
  region: string;
  eventType: string | null;
  series: string;
  season: string;
  startDate: string | null;
  endDate: string | null;
  prizePool: number | null;
  prizePoolUsd: number | null;
  organizer: string;
  sourceLink: string;
  status: "COMPLETED" | "UPCOMING";
  winner?: string;
  runnerUp?: string;
  teams: TeamDef[];
  prizeBreakdown: PrizeRow[];
};

const tournaments: TournamentDef[] = [
  // --- Completed ---------------------------------------------------------
  {
    slug: "bgmi-series-2026",
    name: "BGMI Series 2026",
    tier: "A-Tier",
    region: "India",
    eventType: "Mix (Online + LAN)",
    series: "BGMI Series",
    season: "2026",
    startDate: "2026-01-26",
    endDate: "2026-03-29",
    prizePool: 40_000_000,
    prizePoolUsd: 422_019,
    organizer: "KRAFTON, Tesseract Esports",
    sourceLink: "https://liquipedia.net/pubgmobile/Battlegrounds_Mobile_India_Series/2026",
    status: "COMPLETED",
    winner: "Team SouL",
    runnerUp: "Genesis Esports",
    teams: [
      { name: "Team SouL", region: "India" },
      { name: "Genesis Esports", region: "India" },
      { name: "Orangutan", region: "India" },
      { name: "Victores Sumus", region: "India" },
      { name: "GodLike Esports", region: "India" },
      { name: "K9 Esports", region: "India" },
      { name: "Revenant XSpark", region: "India" },
      { name: "Wyld Fangs", region: "India" },
      { name: "Vasista Esports", region: "India" },
      { name: "Nebula Esports", region: "India" },
      { name: "Learn From Past", region: "India" },
      { name: "Meta Ninza", region: "India" },
      { name: "Myth Official", region: "India" },
      { name: "Reckoning Esports", region: "India" },
      { name: "Team Tamilas", region: "India" },
      { name: "Welt Esports", region: "India" },
    ],
    // Ranks 6-16 were only published in USD on the source page — INR here is
    // back-derived from rank 1-5's own published INR/USD pair (~94.79
    // INR/USD, consistent across all five), not a separate guess. All land
    // on round figures, matching how every other tournament's breakdown reads.
    prizeBreakdown: [
      { rank: "1st", amountInr: 10_000_000 },
      { rank: "2nd", amountInr: 5_000_000 },
      { rank: "3rd", amountInr: 3_500_000 },
      { rank: "4th", amountInr: 2_500_000 },
      { rank: "5th", amountInr: 2_050_000 },
      { rank: "6th", amountInr: 1_600_000 },
      { rank: "7th", amountInr: 1_400_000 },
      { rank: "8th", amountInr: 1_400_000 },
      { rank: "9th", amountInr: 1_150_000 },
      { rank: "10th", amountInr: 1_150_000 },
      { rank: "11th", amountInr: 1_000_000 },
      { rank: "12th", amountInr: 1_000_000 },
      { rank: "13th", amountInr: 900_000 },
      { rank: "14th", amountInr: 900_000 },
      { rank: "15th", amountInr: 800_000 },
      { rank: "16th", amountInr: 800_000 },
    ],
  },
  {
    slug: "rising-star-invitational-2026",
    name: "Rising Star Invitational 2026",
    tier: "C-Tier",
    region: "India",
    eventType: "Online",
    series: "Rising Star Invitational",
    season: "2026",
    startDate: "2026-07-03",
    endDate: "2026-07-05",
    prizePool: 500_000,
    prizePoolUsd: 5_251,
    organizer: "KRAFTON, Tesseract Esports",
    sourceLink: "https://liquipedia.net/pubgmobile/Rising_Star_Invitational/2026",
    status: "COMPLETED",
    winner: "Krazy Kratos",
    runnerUp: "Justy's Jesters",
    teams: [
      { name: "Krazy Kratos", region: "India" },
      { name: "Justy's Jesters", region: "India" },
      { name: "Most Wanted", region: "India" },
      { name: "Jatin Hunters", region: "India" },
      { name: "Solidarity Saumraj", region: "India" },
      { name: "Knight Nightmare", region: "India" },
      { name: "Hector Warriors", region: "India" },
      { name: "Hydro Hydrogen", region: "India" },
      { name: "Super Sam", region: "India" },
      { name: "Noobpari Clashers", region: "India" },
      { name: "Jasleen Titans", region: "India" },
      { name: "Shiraj Sena", region: "India" },
      { name: "Evil Squad", region: "India" },
      { name: "Levi's Shoorveers", region: "India" },
      { name: "Mernox Reapers", region: "India" },
      { name: "Tahchapa Zalai", region: "India" },
    ],
    // Only 1st-3rd carried prize money on the source page — 4th-16th are
    // real participants with no payout, not a data gap.
    prizeBreakdown: [
      { rank: "1st", amountInr: 250_000 },
      { rank: "2nd", amountInr: 125_000 },
      { rank: "3rd", amountInr: 75_000 },
    ],
  },
  {
    slug: "bgmi-pro-series-2026",
    name: "BGMI Pro Series 2026",
    tier: "A-Tier",
    region: "India",
    eventType: null,
    series: "BGMI Pro Series",
    season: "2026",
    startDate: "2026-06-09",
    endDate: "2026-06-21",
    // Prize pool not retrievable from the source page (results tables
    // truncated on every fetch attempt) — only the champion is confirmed.
    prizePool: null,
    prizePoolUsd: null,
    organizer: "KRAFTON, Tesseract Esports",
    sourceLink: "https://liquipedia.net/pubgmobile/Battlegrounds_Mobile_India_Pro_Series/2026",
    status: "COMPLETED",
    winner: "GodLike Esports",
    // Full 16-team roster isn't known (results table unavailable) — only the
    // champion is confirmed, so `teams` stays empty and the winner is
    // resolved/upserted separately rather than listed as a lone "participant".
    teams: [],
    prizeBreakdown: [],
  },
  // --- Upcoming (rosters/exact prize not yet finalized on the source) ----
  {
    slug: "bgmi-naye-khiladi-2026",
    name: "BGMI: Naye Khiladi",
    tier: "B-Tier",
    region: "India",
    eventType: "Online",
    series: "BGMI Naye Khiladi",
    season: "2026",
    startDate: "2026-07-24",
    endDate: "2026-07-26",
    prizePool: 1_000_000,
    prizePoolUsd: 10_435,
    organizer: "NODWIN Gaming, KRAFTON",
    sourceLink: "https://liquipedia.net/pubgmobile/BGMI_Naye_Khiladi",
    status: "UPCOMING",
    teams: [],
    prizeBreakdown: [],
  },
  {
    slug: "bgmi-showdown-2026",
    name: "BGMI Showdown 2026",
    tier: null,
    region: "India",
    eventType: null,
    series: "BGMI Showdown",
    season: "2026",
    startDate: null,
    endDate: null,
    prizePool: null,
    prizePoolUsd: null,
    organizer: "KRAFTON, Tesseract Esports",
    sourceLink: "https://liquipedia.net/pubgmobile/Battlegrounds_Mobile_India_Showdown/2026",
    status: "UPCOMING",
    teams: [],
    prizeBreakdown: [],
  },
  {
    slug: "bgmi-international-cup-2026",
    name: "BGMI International Cup 2026",
    tier: "A-Tier",
    region: "International",
    eventType: null,
    series: "BGMI International Cup",
    season: "2026",
    startDate: null,
    endDate: null,
    prizePool: null,
    prizePoolUsd: null,
    organizer: "KRAFTON, Tesseract Esports",
    sourceLink: "https://liquipedia.net/pubgmobile/Battlegrounds_Mobile_India_International_Cup/2026",
    status: "UPCOMING",
    teams: [],
    prizeBreakdown: [],
  },
  {
    slug: "trident-ignite-2026-road-to-masters",
    name: "Trident IGNITE: Road to Masters",
    tier: "B-Tier",
    region: "India",
    eventType: "Online",
    series: "Trident IGNITE",
    season: "2026",
    startDate: "2026-09-08",
    endDate: "2026-09-10",
    prizePool: 1_000_000,
    prizePoolUsd: 10_373,
    organizer: "Trident Esports, KRAFTON",
    sourceLink: "https://liquipedia.net/pubgmobile/Trident_Ignite/2026/Road_to_Masters",
    status: "UPCOMING",
    teams: [],
    prizeBreakdown: [],
  },
  {
    slug: "trident-ignite-2026-challengers-vs-masters",
    name: "Trident IGNITE: Challengers vs Masters",
    tier: "C-Tier",
    region: "India",
    eventType: "Online",
    series: "Trident IGNITE",
    season: "2026",
    startDate: "2026-09-11",
    endDate: "2026-09-14",
    prizePool: 500_000,
    prizePoolUsd: 5_186,
    organizer: "Trident Esports, KRAFTON",
    sourceLink: "https://liquipedia.net/pubgmobile/Trident_Ignite/2026/Challengers_vs_Masters",
    status: "UPCOMING",
    teams: [],
    prizeBreakdown: [],
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
    // Resolved independently of `teams` (the participant list) — a winner
    // confirmed by source even without a full roster (e.g. BMPS 2026) still
    // needs its Team row upserted and linked via winnerTeamId.
    const winner = def.winner ? await getTeam({ name: def.winner, region: def.region }) : undefined;
    const runnerUp = def.runnerUp ? await getTeam({ name: def.runnerUp, region: def.region }) : undefined;

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
        startDate: def.startDate ? new Date(def.startDate) : null,
        endDate: def.endDate ? new Date(def.endDate) : null,
        prizePool: def.prizePool,
        prizePoolUsd: def.prizePoolUsd,
        prizeBreakdownJson:
          def.prizeBreakdown.length > 0
            ? (def.prizeBreakdown as unknown as Prisma.InputJsonValue)
            : Prisma.JsonNull,
        organizer: def.organizer,
        sourceLink: def.sourceLink,
        status: def.status,
        winnerTeamId: winner?.id,
        runnerUpTeamId: runnerUp?.id,
      },
    });

    await prisma.pointsSystem.create({
      data: { tournamentId: tournament.id, placementPointsJson: DEFAULT_PLACEMENT_POINTS, pointsPerKill: 1 },
    });

    if (teams.length > 0) {
      await prisma.stage.create({
        data: {
          tournamentId: tournament.id,
          name: "Grand Finals",
          order: 0,
          startDate: def.startDate ? new Date(def.startDate) : null,
          endDate: def.endDate ? new Date(def.endDate) : null,
        },
      });

      await prisma.tournamentTeam.createMany({
        data: teams.map((team) => ({ tournamentId: tournament.id, teamId: team.id })),
      });
    }

    console.log(`Imported: ${def.name} — ${teams.length} teams (${def.status})`);
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
