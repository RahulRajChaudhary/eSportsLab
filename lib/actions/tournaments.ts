"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { Prisma } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-guard";
import { revalidateTournament } from "@/lib/revalidate-content";
import { slugify, uniqueSlug } from "@/lib/slug";
import { parseKeyValueJson } from "@/lib/json-field";

export type ActionState = { error?: string; success?: boolean };

// Standard BGMI-style default — mirrors prisma/seed.ts's placementPoints so
// a freshly created BR tournament has a sane, editable starting table
// instead of an empty one that would make every match entry score 0.
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

function toIntOrNull(v?: string) {
  if (!v || v.trim() === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? Math.round(n) : null;
}

function toDateOrNull(v?: string) {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

function parsePrizeBreakdown(json: string): Prisma.InputJsonValue | typeof Prisma.JsonNull {
  try {
    const obj: Record<string, string> = JSON.parse(json);
    const rows = Object.entries(obj)
      .filter(([, v]) => v.trim() !== "")
      .map(([rank, amount]) => ({ rank, amountInr: Number(amount) || 0 }));
    return rows.length > 0 ? rows : Prisma.JsonNull;
  } catch {
    return Prisma.JsonNull;
  }
}

const createSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().optional(),
  gameId: z.string().min(1, "Game is required"),
  tier: z.string().optional(),
  region: z.string().optional(),
  eventType: z.string().optional(),
  series: z.string().optional(),
  season: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  organizer: z.string().optional(),
  sourceLink: z.string().min(1, "Source link is required"),
  status: z.enum(["UPCOMING", "ONGOING", "COMPLETED"]),
  logoUrl: z.string().optional(),
  showTeamLogos: z.string().optional(),
});

export async function createTournament(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();

  const parsed = createSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const d = parsed.data;

  const game = await prisma.game.findUnique({ where: { id: d.gameId } });
  if (!game) return { error: "Unknown game" };

  const slug =
    d.slug?.trim() ||
    (await uniqueSlug(d.name, async (s) => (await prisma.tournament.count({ where: { slug: s } })) > 0));

  const tournament = await prisma.tournament.create({
    data: {
      name: d.name,
      slug,
      gameId: d.gameId,
      tier: d.tier || null,
      region: d.region || null,
      eventType: d.eventType || null,
      series: d.series || null,
      season: d.season || null,
      startDate: toDateOrNull(d.startDate),
      endDate: toDateOrNull(d.endDate),
      organizer: d.organizer || null,
      sourceLink: d.sourceLink,
      status: d.status,
      logoUrl: d.logoUrl || null,
      showTeamLogos: d.showTeamLogos === "on",
    },
  });

  if (game.formatType === "BR") {
    await prisma.pointsSystem.create({
      data: { tournamentId: tournament.id, placementPointsJson: DEFAULT_PLACEMENT_POINTS, pointsPerKill: 1 },
    });
  }

  revalidateTournament(game.slug, tournament.slug);
  redirect(`/admin/tournaments/${tournament.id}/edit`);
}

const detailsSchema = createSchema.extend({
  prizePool: z.string().optional(),
  prizePoolUsd: z.string().optional(),
  winnerTeamId: z.string().optional(),
  runnerUpTeamId: z.string().optional(),
  prizeBreakdownJson: z.string(),
});

export async function updateTournamentDetails(
  tournamentId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const parsed = detailsSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const d = parsed.data;

  const existing = await prisma.tournament.findUnique({ where: { id: tournamentId }, include: { game: true } });
  if (!existing) return { error: "Tournament not found" };

  const game = await prisma.game.findUnique({ where: { id: d.gameId } });
  if (!game) return { error: "Unknown game" };

  let slug = existing.slug;
  const requestedSlug = d.slug?.trim() || slugify(d.name);
  if (requestedSlug !== existing.slug) {
    slug = await uniqueSlug(requestedSlug, async (s) => {
      const count = await prisma.tournament.count({ where: { slug: s, NOT: { id: tournamentId } } });
      return count > 0;
    });
  }

  await prisma.tournament.update({
    where: { id: tournamentId },
    data: {
      name: d.name,
      slug,
      gameId: d.gameId,
      tier: d.tier || null,
      region: d.region || null,
      eventType: d.eventType || null,
      series: d.series || null,
      season: d.season || null,
      startDate: toDateOrNull(d.startDate),
      endDate: toDateOrNull(d.endDate),
      prizePool: toIntOrNull(d.prizePool),
      prizePoolUsd: toIntOrNull(d.prizePoolUsd),
      organizer: d.organizer || null,
      sourceLink: d.sourceLink,
      status: d.status,
      logoUrl: d.logoUrl || null,
      showTeamLogos: d.showTeamLogos === "on",
      winnerTeamId: d.winnerTeamId || null,
      runnerUpTeamId: d.runnerUpTeamId || null,
      prizeBreakdownJson: parsePrizeBreakdown(d.prizeBreakdownJson),
    },
  });

  revalidateTournament(existing.game.slug, existing.slug);
  if (slug !== existing.slug) revalidateTournament(game.slug, slug);
  return { success: true };
}

const pointsSystemSchema = z.object({
  pointsPerKill: z.string().min(1),
  placementPointsJson: z.string(),
  customStatColumnsJson: z.string(),
});

export async function updatePointsSystem(
  tournamentId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const parsed = pointsSystemSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const tournament = await prisma.tournament.findUnique({ where: { id: tournamentId }, include: { game: true } });
  if (!tournament) return { error: "Tournament not found" };

  let placementPoints: Record<string, number>;
  try {
    const raw: Record<string, string> = JSON.parse(parsed.data.placementPointsJson);
    placementPoints = Object.fromEntries(
      Object.entries(raw)
        .filter(([k, v]) => k.trim() !== "" && v.trim() !== "")
        .map(([k, v]) => [k.trim(), Number(v) || 0]),
    );
  } catch {
    return { error: "Invalid placement points" };
  }

  const pointsPerKill = toIntOrNull(parsed.data.pointsPerKill) ?? 0;

  await prisma.$transaction([
    prisma.pointsSystem.upsert({
      where: { tournamentId },
      create: { tournamentId, placementPointsJson: placementPoints, pointsPerKill },
      update: { placementPointsJson: placementPoints, pointsPerKill },
    }),
    prisma.tournament.update({
      where: { id: tournamentId },
      data: { customStatColumnsJson: parseKeyValueJson(parsed.data.customStatColumnsJson) },
    }),
  ]);

  revalidateTournament(tournament.game.slug, tournament.slug);
  return { success: true };
}

const stageSchema = z.object({
  tournamentId: z.string().min(1),
  name: z.string().min(1, "Name is required"),
  order: z.string().optional(),
  description: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export async function addStage(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();

  const parsed = stageSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const d = parsed.data;

  const tournament = await prisma.tournament.findUnique({ where: { id: d.tournamentId }, include: { game: true } });
  if (!tournament) return { error: "Tournament not found" };

  await prisma.stage.create({
    data: {
      tournamentId: d.tournamentId,
      name: d.name,
      order: toIntOrNull(d.order) ?? 0,
      description: d.description || null,
      startDate: toDateOrNull(d.startDate),
      endDate: toDateOrNull(d.endDate),
    },
  });

  revalidateTournament(tournament.game.slug, tournament.slug);
  return { success: true };
}

export async function updateStage(
  stageId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const parsed = stageSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const d = parsed.data;

  const stage = await prisma.stage.update({
    where: { id: stageId },
    data: {
      name: d.name,
      order: toIntOrNull(d.order) ?? 0,
      description: d.description || null,
      startDate: toDateOrNull(d.startDate),
      endDate: toDateOrNull(d.endDate),
    },
    include: { tournament: { include: { game: true } } },
  });

  revalidateTournament(stage.tournament.game.slug, stage.tournament.slug);
  return { success: true };
}

export async function deleteStage(
  stageId: string,
  _prevState: ActionState,
  _formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const stage = await prisma.stage.findUnique({
    where: { id: stageId },
    include: { tournament: { include: { game: true } } },
  });
  if (!stage) return { error: "Stage not found" };

  try {
    await prisma.stage.delete({ where: { id: stageId } });
  } catch {
    return { error: "Can't delete this stage — it already has matches recorded." };
  }

  revalidateTournament(stage.tournament.game.slug, stage.tournament.slug);
  return { success: true };
}

const participantSchema = z.object({
  tournamentId: z.string().min(1),
  teamId: z.string().min(1, "Select a team"),
  groupName: z.string().optional(),
});

export async function addParticipant(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();

  const parsed = participantSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const d = parsed.data;

  const tournament = await prisma.tournament.findUnique({ where: { id: d.tournamentId }, include: { game: true } });
  if (!tournament) return { error: "Tournament not found" };

  try {
    await prisma.tournamentTeam.create({
      data: { tournamentId: d.tournamentId, teamId: d.teamId, groupName: d.groupName || null },
    });
  } catch {
    return { error: "That team is already in this tournament." };
  }

  revalidateTournament(tournament.game.slug, tournament.slug);
  return { success: true };
}

export async function removeParticipant(
  tournamentTeamId: string,
  _prevState: ActionState,
  _formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const participant = await prisma.tournamentTeam.findUnique({
    where: { id: tournamentTeamId },
    include: { tournament: { include: { game: true } } },
  });
  if (!participant) return { error: "Not found" };

  await prisma.tournamentTeam.delete({ where: { id: tournamentTeamId } });

  revalidateTournament(participant.tournament.game.slug, participant.tournament.slug);
  return { success: true };
}
