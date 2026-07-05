import { prisma } from "@/lib/prisma";

export type BRStandingsRow = {
  teamId: string;
  teamName: string;
  matches: number;
  kills: number;
  points: number;
  wwcd: number;
};

export type BRStandingsEntryInput = {
  teamId: string;
  team: { name: string };
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
