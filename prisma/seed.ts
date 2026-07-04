import { PrismaClient } from "../app/generated/prisma/client";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set — check your .env file");
}

const prisma = new PrismaClient({ accelerateUrl: process.env.DATABASE_URL });

// Mirrors the "compute at entry time, then store" rule from the schema:
// PointsSystem defines the rules, but pointsEarned is calculated once here
// and never recomputed later.
function computeBRPoints(
  placementPoints: Record<string, number>,
  placement: number,
  kills: number,
  pointsPerKill: number,
) {
  return (placementPoints[String(placement)] ?? 0) + kills * pointsPerKill;
}

async function main() {
  // Wipe in FK-safe order (children before parents) so the script is
  // rerunnable during development.
  await prisma.revision.deleteMany();
  await prisma.user.deleteMany();
  await prisma.rankingSnapshot.deleteMany();
  
  await prisma.newsPost.deleteMany();
  await prisma.rosterHistory.deleteMany();
  await prisma.groupStandingsRow.deleteMany();
  await prisma.mapScore.deleteMany();
  await prisma.h2HMatch.deleteMany();
  await prisma.bRMatchEntry.deleteMany();
  await prisma.bRMatch.deleteMany();
  await prisma.bRStandingsColumn.deleteMany();
  await prisma.pointsSystem.deleteMany();
  await prisma.stage.deleteMany();
  await prisma.tournamentTeam.deleteMany();
  await prisma.tournament.deleteMany();
  await prisma.player.deleteMany();
  await prisma.team.deleteMany();
  await prisma.game.deleteMany();

  // ---------------------------------------------------------------------
  // Games
  // ---------------------------------------------------------------------
  const bgmi = await prisma.game.create({
    data: { slug: "bgmi", name: "BGMI", formatType: "BR" },
  });

  const valorant = await prisma.game.create({
    data: { slug: "valorant", name: "Valorant", formatType: "H2H" },
  });

  // ---------------------------------------------------------------------
  // BGMI (Battle Royale) — teams, players, roster history
  // ---------------------------------------------------------------------
  // Real BGMI competitive lobbies are 16 squads (64 players, 4 per squad).
  const brTeamNames = [
    "Chained Esports",
    "Nova Blitz",
    "Kraken Squad",
    "Obsidian Five",
    "Vantage Point",
    "Iron Jackals",
    "Solar Flare",
    "Midnight Vipers",
    "Titan Reapers",
    "Phantom Circuit",
    "Rapid Fire",
    "Ashen Wolves",
    "Neon Strike",
    "Ember Squad",
    "Rogue Frontier",
    "Zenith Gaming",
  ];

  const brTeams = await Promise.all(
    brTeamNames.map((name) =>
      prisma.team.create({
        data: {
          slug: name.toLowerCase().replace(/\s+/g, "-"),
          name,
          gameId: bgmi.id,
          region: "India",
        },
      }),
    ),
  );

  const brRoles = ["Assaulter", "Support", "Sniper", "IGL"];
  for (const team of brTeams) {
    for (let i = 0; i < 4; i++) {
      const playerName = `${team.name.split(" ")[0]}${i + 1}`;
      const player = await prisma.player.create({
        data: {
          slug: `${team.slug}-p${i + 1}`,
          name: playerName,
          gameId: bgmi.id,
          country: "IN",
        },
      });
      await prisma.rosterHistory.create({
        data: {
          playerId: player.id,
          teamId: team.id,
          role: brRoles[i],
          joinedAt: new Date("2026-01-01"),
        },
      });
    }
  }

  // ---------------------------------------------------------------------
  // BGMI Tournament — the full BR shape (PointsSystem, Stage, BRMatch,
  // BRMatchEntry, BRStandingsColumn) wired together end to end.
  // ---------------------------------------------------------------------
  const brTournament = await prisma.tournament.create({
    data: {
      slug: "chained-masters-series-1",
      name: "Chained Masters Series 1",
      gameId: bgmi.id,
      tier: "Tier 2",
      region: "India",
      startDate: new Date("2026-07-01"),
      endDate: new Date("2026-07-07"),
      prizePool: 500000,
      organizer: "Chained Gaming Org",
      sourceLink: "https://youtube.com/watch?v=fake-cms1-broadcast",
      status: "ONGOING",
    },
  });

  await prisma.tournamentTeam.createMany({
    data: brTeams.map((team) => ({
      tournamentId: brTournament.id,
      teamId: team.id,
    })),
  });

  // Full 1st-16th range stored explicitly — a 16-team lobby means ranks
  // 9-16 are real placements, not an absent case a fallback should paper over.
  // Theoretical max per match: 10 placement + 60 kills (64 players in lobby,
  // 4 are your own team, so 60 enemies max) = 70, though real matches
  // rarely exceed 45.
  const placementPoints: Record<string, number> = {
    "1": 10,
    "2": 6,
    "3": 5,
    "4": 4,
    "5": 3,
    "6": 2,
    "7": 1,
    "8": 1,
    "9": 0,
    "10": 0,
    "11": 0,
    "12": 0,
    "13": 0,
    "14": 0,
    "15": 0,
    "16": 0,
  };
  const pointsPerKill = 1;

  await prisma.pointsSystem.create({
    data: {
      tournamentId: brTournament.id,
      placementPointsJson: placementPoints,
      pointsPerKill,
    },
  });

  await prisma.bRStandingsColumn.create({
    data: { tournamentId: brTournament.id },
  });

  const groupStage = await prisma.stage.create({
    data: { tournamentId: brTournament.id, name: "Group Stage", order: 0 },
  });

  // Two matches, all 16 teams placing differently each time (indices align
  // with brTeamNames order). Kills per match must sum to at most 60 — a
  // 64-player lobby means each 4-player squad has 60 possible enemies to
  // eliminate; real matches usually land well under that (30-50) since some
  // players die to the zone rather than being finished by an opponent.
  const brMatchResults = [
    [
      { placement: 1, kills: 9 },
      { placement: 2, kills: 6 },
      { placement: 3, kills: 4 },
      { placement: 4, kills: 5 },
      { placement: 5, kills: 3 },
      { placement: 6, kills: 2 },
      { placement: 7, kills: 4 },
      { placement: 8, kills: 1 },
      { placement: 9, kills: 2 },
      { placement: 10, kills: 1 },
      { placement: 11, kills: 0 },
      { placement: 12, kills: 1 },
      { placement: 13, kills: 0 },
      { placement: 14, kills: 0 },
      { placement: 15, kills: 1 },
      { placement: 16, kills: 0 },
    ],
    [
      { placement: 2, kills: 5 },
      { placement: 1, kills: 7 },
      { placement: 4, kills: 3 },
      { placement: 3, kills: 6 },
      { placement: 6, kills: 2 },
      { placement: 5, kills: 4 },
      { placement: 8, kills: 3 },
      { placement: 7, kills: 1 },
      { placement: 10, kills: 2 },
      { placement: 9, kills: 0 },
      { placement: 12, kills: 0 },
      { placement: 11, kills: 1 },
      { placement: 14, kills: 0 },
      { placement: 13, kills: 1 },
      { placement: 16, kills: 1 },
      { placement: 15, kills: 0 },
    ],
  ];

  // Official CMPI/esports competitive map pool.
  const brMapPool = ["Erangel", "Miramar", "Rondo"];

  for (let matchNumber = 0; matchNumber < brMatchResults.length; matchNumber++) {
    const match = await prisma.bRMatch.create({
      data: {
        tournamentId: brTournament.id,
        stageId: groupStage.id,
        matchNumber: matchNumber + 1,
        mapName: brMapPool[matchNumber % brMapPool.length],
        scheduledAt: new Date(`2026-07-0${matchNumber + 1}T14:00:00Z`),
      },
    });
    

    const results = brMatchResults[matchNumber];

    const totalKills = results.reduce((sum, r) => sum + r.kills, 0);
    if (totalKills > 60) {
      throw new Error(
        `Match ${matchNumber + 1} has ${totalKills} total kills, exceeding the 60-enemy max for a 64-player lobby`,
      );
    }

    await prisma.bRMatchEntry.createMany({
      data: brTeams.map((team, i) => ({
        brMatchId: match.id,
        teamId: team.id,
        placement: results[i].placement,
        kills: results[i].kills,
        pointsEarned: computeBRPoints(
          placementPoints,
          results[i].placement,
          results[i].kills,
          pointsPerKill,
        ),
      })),
    });
  }

  // ---------------------------------------------------------------------
  // Valorant (Head-to-Head) — proves the schema's other shape independently
  // ---------------------------------------------------------------------
  const vertexGaming = await prisma.team.create({
    data: { slug: "vertex-gaming", name: "Vertex Gaming", gameId: valorant.id, region: "India" },
  });
  const emberRift = await prisma.team.create({
    data: { slug: "ember-rift", name: "Ember Rift", gameId: valorant.id, region: "India" },
  });

  const h2hTournament = await prisma.tournament.create({
    data: {
      slug: "ember-rift-showdown",
      name: "Ember Rift Showdown",
      gameId: valorant.id,
      tier: "Tier 3",
      region: "India",
      startDate: new Date("2026-06-20"),
      endDate: new Date("2026-06-21"),
      organizer: "Ember Rift Org",
      sourceLink: "https://youtube.com/watch?v=fake-ers-broadcast",
      status: "COMPLETED",
    },
  });

  await prisma.tournamentTeam.createMany({
    data: [vertexGaming, emberRift].map((team) => ({
      tournamentId: h2hTournament.id,
      teamId: team.id,
    })),
  });

  const playoffStage = await prisma.stage.create({
    data: { tournamentId: h2hTournament.id, name: "Playoffs", order: 0 },
  });

  const h2hMatch = await prisma.h2HMatch.create({
    data: {
      tournamentId: h2hTournament.id,
      stageId: playoffStage.id,
      teamAId: vertexGaming.id,
      teamBId: emberRift.id,
      bestOf: 3,
      scheduledAt: new Date("2026-06-21T18:00:00Z"),
    },
  });

  // Bo3, Vertex wins 2-1
  await prisma.mapScore.createMany({
    data: [
      { h2hMatchId: h2hMatch.id, mapName: "Ascent", scoreA: 13, scoreB: 9, winnerTeamId: vertexGaming.id, order: 1 },
      { h2hMatchId: h2hMatch.id, mapName: "Bind", scoreA: 10, scoreB: 13, winnerTeamId: emberRift.id, order: 2 },
      { h2hMatchId: h2hMatch.id, mapName: "Haven", scoreA: 13, scoreB: 11, winnerTeamId: vertexGaming.id, order: 3 },
    ],
  });

  await prisma.groupStandingsRow.createMany({
    data: [
      {
        // Round diff = sum of (scoreA - scoreB) across the 3 maps:
        // (13-9) + (10-13) + (13-11) = +3
        tournamentId: h2hTournament.id,
        groupName: "Playoffs",
        teamId: vertexGaming.id,
        wins: 1,
        losses: 0,
        mapDiff: 1,
        roundDiff: 3,
        // VCL-style orgs rank by match/map/round record, not a points
        // column — left at 0 here to match that real-world convention.
        points: 0,
      },
      {
        tournamentId: h2hTournament.id,
        groupName: "Playoffs",
        teamId: emberRift.id,
        wins: 0,
        losses: 1,
        mapDiff: -1,
        roundDiff: -3,
        points: 0,
      },
    ],
  });

  // ---------------------------------------------------------------------
  // Rankings, news
  // ---------------------------------------------------------------------
  await prisma.rankingSnapshot.createMany({
    data: brTeams.map((team, i) => ({
      gameId: bgmi.id,
      teamId: team.id,
      points: (brTeams.length - i) * 20,
      rank: i + 1,
    })),
  });

  await prisma.newsPost.create({
    data: {
      slug: "chained-masters-series-1-kicks-off",
      title: "Chained Masters Series 1 kicks off in India",
      body: "Four teams battle it out in the first group stage matches of CMS1.",
      gameId: bgmi.id,
      author: "EsportsHub Staff",
      publishedAt: new Date("2026-07-01"),
    },
  });

  // ---------------------------------------------------------------------
  // Contributor & moderation (Module 4) — one admin, one pending submission
  // ---------------------------------------------------------------------
  const admin = await prisma.user.create({
    data: { email: "admin@esportshub.site", name: "Admin", role: "ADMIN" },
  });

  const contributor = await prisma.user.create({
    data: { email: "contributor@example.com", name: "Test Contributor", role: "USER" },
  });

  await prisma.revision.create({
    data: {
      entityType: "TEAM",
      entityId: null,
      diffJson: {
        name: "Frostbyte Gaming",
        gameId: bgmi.id,
        region: "India",
      },
      sourceLink: "https://twitter.com/fake/status/fake-announcement",
      editorId: contributor.id,
      status: "PENDING",
    },
  });

  console.log("Seed complete:", {
    games: 2,
    brTeams: brTeams.length,
    h2hTeams: 2,
    tournaments: 2,
    users: 2,
    admin: admin.email,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
