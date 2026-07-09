"use server";

import { z } from "zod";
import { Prisma } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-guard";
import { revalidateTournament } from "@/lib/revalidate-content";
import { computeBRPoints } from "@/lib/br-standings";

export type ActionState = { error?: string; success?: boolean };

const createMatchSchema = z.object({
  stageId: z.string().min(1),
  matchNumber: z.string().min(1),
  mapName: z.string().min(1, "Map is required"),
  scheduledAt: z.string().optional(),
});

async function loadStageWithTournament(stageId: string) {
  return prisma.stage.findUnique({
    where: { id: stageId },
    include: { tournament: { include: { game: true, pointsSystem: true } } },
  });
}

export async function createBRMatch(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();

  const parsed = createMatchSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const d = parsed.data;

  const stage = await loadStageWithTournament(d.stageId);
  if (!stage) return { error: "Stage not found" };

  const matchNumber = Number(d.matchNumber);
  if (!Number.isFinite(matchNumber)) return { error: "Invalid match number" };

  await prisma.bRMatch.create({
    data: {
      tournamentId: stage.tournamentId,
      stageId: d.stageId,
      matchNumber: Math.round(matchNumber),
      mapName: d.mapName,
      scheduledAt: d.scheduledAt ? new Date(d.scheduledAt) : null,
    },
  });

  revalidateTournament(stage.tournament.game.slug, stage.tournament.slug);
  return { success: true };
}

export async function deleteBRMatch(
  matchId: string,
  _prevState: ActionState,
  _formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const match = await prisma.bRMatch.findUnique({
    where: { id: matchId },
    include: { stage: { include: { tournament: { include: { game: true } } } } },
  });
  if (!match) return { error: "Match not found" };

  await prisma.$transaction([
    prisma.bRMatchEntry.deleteMany({ where: { brMatchId: matchId } }),
    prisma.bRMatch.delete({ where: { id: matchId } }),
  ]);

  revalidateTournament(match.stage.tournament.game.slug, match.stage.tournament.slug);
  return { success: true };
}

const entryRowSchema = z.object({
  teamId: z.string().min(1),
  placement: z.union([z.string(), z.number()]),
  kills: z.union([z.string(), z.number()]),
  customStats: z.record(z.string(), z.union([z.string(), z.number()])).optional(),
});

const saveEntriesSchema = z.object({ rowsJson: z.string() });

// Server Action bound to a match-entry form where the admin freely adds/
// removes team rows (see components/admin/br-match-entry-form.tsx) — not
// fixed to "one row per tournament participant", since not every match has
// every participant in it. Rows are submitted as a single `rowsJson` array,
// mirroring lib/actions/csv-import.ts's shape.
export async function saveBRMatchEntries(
  matchId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const parsed = saveEntriesSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Invalid input" };

  let rows: {
    teamId: string;
    placement: string | number;
    kills: string | number;
    customStats?: Record<string, string | number>;
  }[];
  try {
    rows = z.array(entryRowSchema).parse(JSON.parse(parsed.data.rowsJson));
  } catch {
    return { error: "Couldn't read the match rows." };
  }

  const match = await prisma.bRMatch.findUnique({
    where: { id: matchId },
    include: {
      stage: {
        include: {
          tournament: { include: { game: true, pointsSystem: true, participants: true } },
        },
      },
    },
  });
  if (!match) return { error: "Match not found" };

  const pointsSystem = match.stage.tournament.pointsSystem;
  if (!pointsSystem) return { error: "This tournament has no points system configured yet." };
  const placementPoints = pointsSystem.placementPointsJson as Record<string, number>;

  const participantIds = new Set(match.stage.tournament.participants.map((p) => p.teamId));
  const allowedStatKeys = new Set(
    Object.keys((match.stage.tournament.customStatColumnsJson as Record<string, string>) ?? {}),
  );
  const seen = new Set<string>();
  const entries: {
    teamId: string;
    placement: number;
    kills: number;
    pointsEarned: number;
    customStatsJson: Prisma.InputJsonValue | typeof Prisma.JsonNull;
  }[] = [];

  for (const row of rows) {
    if (!participantIds.has(row.teamId)) return { error: "One of the selected teams isn't a tournament participant." };
    if (seen.has(row.teamId)) return { error: "The same team appears twice." };
    seen.add(row.teamId);

    const placement = Number(row.placement);
    const kills = Number(row.kills) || 0;
    if (!Number.isFinite(placement) || placement < 1) return { error: "Invalid placement for one of the teams." };

    const customStats = Object.fromEntries(
      Object.entries(row.customStats ?? {}).filter(([k]) => allowedStatKeys.has(k)),
    );

    entries.push({
      teamId: row.teamId,
      placement: Math.round(placement),
      kills: Math.round(kills),
      pointsEarned: computeBRPoints(placementPoints, Math.round(placement), Math.round(kills), pointsSystem.pointsPerKill),
      customStatsJson: Object.keys(customStats).length > 0 ? customStats : Prisma.JsonNull,
    });
  }

  // Rows can be freely removed now, so this save is authoritative for the
  // match's entry set — full replace, not upsert-only, or a removed row's
  // old entry would keep counting toward standings forever.
  await prisma.$transaction([
    prisma.bRMatchEntry.deleteMany({ where: { brMatchId: matchId } }),
    prisma.bRMatchEntry.createMany({ data: entries.map((e) => ({ brMatchId: matchId, ...e })) }),
  ]);

  revalidateTournament(match.stage.tournament.game.slug, match.stage.tournament.slug);
  return { success: true };
}
