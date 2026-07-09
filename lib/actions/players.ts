"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-guard";
import { revalidatePlayer } from "@/lib/revalidate-content";
import { slugify, uniqueSlug } from "@/lib/slug";
import { parseKeyValueJson } from "@/lib/json-field";

export type ActionState = { error?: string; success?: boolean };

const playerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().optional(),
  gameId: z.string().min(1, "Game is required"),
  realName: z.string().optional(),
  imageUrl: z.string().optional(),
  country: z.string().optional(),
  socialsJson: z.string(),
});

export async function createPlayer(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();

  const parsed = playerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const { name, gameId, realName, imageUrl, country, socialsJson } = parsed.data;

  const game = await prisma.game.findUnique({ where: { id: gameId } });
  if (!game) return { error: "Unknown game" };

  const slug =
    parsed.data.slug?.trim() ||
    (await uniqueSlug(name, async (s) => (await prisma.player.count({ where: { slug: s } })) > 0));

  const player = await prisma.player.create({
    data: {
      name,
      slug,
      gameId,
      realName: realName || null,
      imageUrl: imageUrl || null,
      country: country || null,
      socials: parseKeyValueJson(socialsJson),
    },
  });

  revalidatePlayer(player.slug);
  redirect(`/admin/players/${player.id}/edit`);
}

export async function updatePlayer(
  playerId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const parsed = playerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const { name, gameId, realName, imageUrl, country, socialsJson } = parsed.data;

  const existing = await prisma.player.findUnique({ where: { id: playerId } });
  if (!existing) return { error: "Player not found" };

  const game = await prisma.game.findUnique({ where: { id: gameId } });
  if (!game) return { error: "Unknown game" };

  let slug = existing.slug;
  const requestedSlug = parsed.data.slug?.trim() || slugify(name);
  if (requestedSlug !== existing.slug) {
    slug = await uniqueSlug(requestedSlug, async (s) => {
      const count = await prisma.player.count({ where: { slug: s, NOT: { id: playerId } } });
      return count > 0;
    });
  }

  await prisma.player.update({
    where: { id: playerId },
    data: {
      name,
      slug,
      gameId,
      realName: realName || null,
      imageUrl: imageUrl || null,
      country: country || null,
      socials: parseKeyValueJson(socialsJson),
    },
  });

  revalidatePlayer(existing.slug);
  if (slug !== existing.slug) revalidatePlayer(slug);
  return { success: true };
}

export async function deletePlayer(
  playerId: string,
  _prevState: ActionState,
  _formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const player = await prisma.player.findUnique({ where: { id: playerId } });
  if (!player) return { error: "Player not found" };

  try {
    await prisma.player.delete({ where: { id: playerId } });
  } catch {
    return {
      error: "Can't delete this player — they have roster history, match awards, or ranking records attached.",
    };
  }

  revalidatePlayer(player.slug);
  redirect("/admin/players");
}
