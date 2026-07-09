"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-guard";
import { revalidateTeam, revalidatePlayer } from "@/lib/revalidate-content";

export type ActionState = { error?: string; success?: boolean };

const addSchema = z.object({
  teamId: z.string().min(1),
  playerId: z.string().min(1, "Select a player"),
  role: z.string().optional(),
  joinedAt: z.string().min(1, "Join date is required"),
});

export async function addRosterEntry(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const parsed = addSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const { teamId, playerId, role, joinedAt } = parsed.data;

  const [team, player] = await Promise.all([
    prisma.team.findUnique({ where: { id: teamId } }),
    prisma.player.findUnique({ where: { id: playerId } }),
  ]);
  if (!team || !player) return { error: "Team or player not found" };

  await prisma.rosterHistory.create({
    data: { teamId, playerId, role: role || null, joinedAt: new Date(joinedAt) },
  });

  revalidateTeam(team.slug);
  revalidatePlayer(player.slug);
  return { success: true };
}

export async function endRosterEntry(
  rosterHistoryId: string,
  _prevState: ActionState,
  _formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const entry = await prisma.rosterHistory.update({
    where: { id: rosterHistoryId },
    data: { leftAt: new Date() },
    include: { team: true, player: true },
  });

  revalidateTeam(entry.team.slug);
  revalidatePlayer(entry.player.slug);
  return { success: true };
}
