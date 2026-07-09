"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-guard";
import { revalidateTournament } from "@/lib/revalidate-content";
import { computeBRPoints } from "@/lib/br-standings";

export type ActionState = { error?: string; success?: boolean };

const rowSchema = z.object({
  teamName: z.string().min(1),
  placement: z.union([z.string(), z.number()]),
  kills: z.union([z.string(), z.number()]),
});

const importSchema = z.object({
  stageId: z.string().min(1),
  matchNumber: z.string().min(1),
  mapName: z.string().min(1, "Map is required"),
  scheduledAt: z.string().optional(),
  rowsJson: z.string(),
});

export async function importBRMatchFromCsv(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const parsed = importSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const d = parsed.data;

  let rows: { teamName: string; placement: string | number; kills: string | number }[];
  try {
    rows = z.array(rowSchema).parse(JSON.parse(d.rowsJson));
  } catch {
    return { error: "Couldn't read the pasted rows — try re-parsing the CSV." };
  }
  if (rows.length === 0) return { error: "No rows to import." };

  const stage = await prisma.stage.findUnique({
    where: { id: d.stageId },
    include: {
      tournament: {
        include: {
          game: true,
          pointsSystem: true,
          participants: { include: { team: true } },
        },
      },
    },
  });
  if (!stage) return { error: "Stage not found" };

  const pointsSystem = stage.tournament.pointsSystem;
  if (!pointsSystem) return { error: "This tournament has no points system configured yet." };
  const placementPoints = pointsSystem.placementPointsJson as Record<string, number>;

  const teamByName = new Map(
    stage.tournament.participants.map((p) => [p.team.name.trim().toLowerCase(), p.team.id]),
  );

  const unmatched: string[] = [];
  const entries: { teamId: string; placement: number; kills: number; pointsEarned: number }[] = [];

  for (const row of rows) {
    const teamId = teamByName.get(row.teamName.trim().toLowerCase());
    if (!teamId) {
      unmatched.push(row.teamName);
      continue;
    }
    const placement = Number(row.placement);
    const kills = Number(row.kills) || 0;
    if (!Number.isFinite(placement) || placement < 1) {
      return { error: `Invalid placement for "${row.teamName}"` };
    }
    entries.push({
      teamId,
      placement: Math.round(placement),
      kills: Math.round(kills),
      pointsEarned: computeBRPoints(placementPoints, Math.round(placement), Math.round(kills), pointsSystem.pointsPerKill),
    });
  }

  if (unmatched.length > 0) {
    return { error: `No participant team matches: ${unmatched.join(", ")}` };
  }

  const matchNumber = Math.round(Number(d.matchNumber));
  if (!Number.isFinite(matchNumber)) return { error: "Invalid match number" };

  await prisma.$transaction(async (tx) => {
    const match = await tx.bRMatch.create({
      data: {
        tournamentId: stage.tournamentId,
        stageId: d.stageId,
        matchNumber,
        mapName: d.mapName,
        scheduledAt: d.scheduledAt ? new Date(d.scheduledAt) : null,
      },
    });
    await tx.bRMatchEntry.createMany({
      data: entries.map((e) => ({ brMatchId: match.id, ...e })),
    });
  });

  revalidateTournament(stage.tournament.game.slug, stage.tournament.slug);
  return { success: true };
}
