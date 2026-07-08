import { prisma } from "@/lib/prisma";

export type BRStandingsRow = {
  teamId: string;
  teamName: string;
  teamSlug: string;
  matches: number;
  kills: number;
  points: number;
  wwcd: number;
};

export type BRStandingsEntryInput = {
  teamId: string;
  team: { name: string; slug: string };
  placement: number;
  kills: number;
  pointsEarned: number;
};

export function aggregateBRStandings(entries: BRStandingsEntryInput[]): BRStandingsRow[] {
  const byTeam = new Map<string, BRStandingsRow>();

  for (const entry of entries) {
    const row = byTeam.get(entry.teamId) ?? {
      teamId: entry.teamId,
      teamName: entry.team.name,
      teamSlug: entry.team.slug,
      matches: 0,
      kills: 0,
      points: 0,
      wwcd: 0,
    };
    row.matches += 1;
    row.kills += entry.kills;
    row.points += entry.pointsEarned;
    if (entry.placement === 1) row.wwcd += 1;
    byTeam.set(entry.teamId, row);
  }

  return Array.from(byTeam.values()).sort(
    (a, b) => b.points - a.points || b.kills - a.kills,
  );
}

export async function getBRStandings(tournamentId: string): Promise<BRStandingsRow[]> {
  const entries = await prisma.bRMatchEntry.findMany({
    where: { brMatch: { tournamentId } },
    include: { team: true },
  });

  return aggregateBRStandings(entries);
}

export type MatchWiseMatch = {
  id: string;
  matchNumber: number;
  mapName: string;
};

export type MatchWiseRow = {
  teamId: string;
  teamName: string;
  teamSlug: string;
  matches: number;
  wwcd: number;
  placementPoints: number;
  finishPoints: number;
  points: number;
  perMatch: Record<string, { placement: number; finishPoints: number; points: number }>;
};

export type MatchWiseStandingsInput = {
  id: string;
  matchNumber: number;
  mapName: string;
  entries: BRStandingsEntryInput[];
};

// Same aggregate totals as aggregateBRStandings, but splits pointsEarned back
// into placement points (PP) vs finish/kill points, and keeps a per-match
// breakdown so the standings table can grow horizontal M1/M2/M3... columns
// instead of linking out to separate match pages (matches the
// Liquipedia/esportsamaze BR standings layout). pointsEarned is stored
// combined (see schema), so finishPoints = kills * pointsPerKill and
// placementPoints is the remainder — same split the seed's computeBRPoints
// used going in.
export function buildMatchWiseStandings(
  matches: MatchWiseStandingsInput[],
  pointsPerKill: number,
): {
  matches: MatchWiseMatch[];
  rows: MatchWiseRow[];
} {
  const byTeam = new Map<string, MatchWiseRow>();

  for (const match of matches) {
    for (const entry of match.entries) {
      const row = byTeam.get(entry.teamId) ?? {
        teamId: entry.teamId,
        teamName: entry.team.name,
        teamSlug: entry.team.slug,
        matches: 0,
        wwcd: 0,
        placementPoints: 0,
        finishPoints: 0,
        points: 0,
        perMatch: {},
      };
      const finishPoints = entry.kills * pointsPerKill;
      const placementPoints = entry.pointsEarned - finishPoints;
      row.matches += 1;
      row.placementPoints += placementPoints;
      row.finishPoints += finishPoints;
      row.points += entry.pointsEarned;
      if (entry.placement === 1) row.wwcd += 1;
      row.perMatch[match.id] = {
        placement: entry.placement,
        finishPoints,
        points: entry.pointsEarned,
      };
      byTeam.set(entry.teamId, row);
    }
  }

  const rows = Array.from(byTeam.values()).sort(
    (a, b) => b.points - a.points || b.finishPoints - a.finishPoints,
  );

  return {
    matches: matches.map((m) => ({ id: m.id, matchNumber: m.matchNumber, mapName: m.mapName })),
    rows,
  };
}
