"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-guard";
import { revalidateTeam, revalidateTournament } from "@/lib/revalidate-content";
import { slugify, uniqueSlug } from "@/lib/slug";
import { parseKeyValueJson } from "@/lib/json-field";

export type ActionState = { error?: string; success?: boolean };

const teamSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().optional(),
  gameId: z.string().min(1, "Game is required"),
  region: z.string().optional(),
  logoUrl: z.string().url().optional().or(z.literal("")),
  socialsJson: z.string(),
});

export async function createTeam(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();

  const parsed = teamSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const { name, gameId, region, logoUrl, socialsJson } = parsed.data;

  const game = await prisma.game.findUnique({ where: { id: gameId } });
  if (!game) return { error: "Unknown game" };

  const slug =
    parsed.data.slug?.trim() ||
    (await uniqueSlug(name, async (s) => (await prisma.team.count({ where: { slug: s } })) > 0));

  const team = await prisma.team.create({
    data: {
      name,
      slug,
      gameId,
      region: region || null,
      logoUrl: logoUrl || null,
      socials: parseKeyValueJson(socialsJson),
    },
  });

  revalidateTeam(team.slug);
  redirect(`/admin/teams/${team.id}/edit`);
}

export async function updateTeam(
  teamId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const parsed = teamSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const { name, gameId, region, logoUrl, socialsJson } = parsed.data;

  const existing = await prisma.team.findUnique({ where: { id: teamId } });
  if (!existing) return { error: "Team not found" };

  const game = await prisma.game.findUnique({ where: { id: gameId } });
  if (!game) return { error: "Unknown game" };

  let slug = existing.slug;
  const requestedSlug = parsed.data.slug?.trim() || slugify(name);
  if (requestedSlug !== existing.slug) {
    slug = await uniqueSlug(requestedSlug, async (s) => {
      const count = await prisma.team.count({ where: { slug: s, NOT: { id: teamId } } });
      return count > 0;
    });
  }

  await prisma.team.update({
    where: { id: teamId },
    data: {
      name,
      slug,
      gameId,
      region: region || null,
      logoUrl: logoUrl || null,
      socials: parseKeyValueJson(socialsJson),
    },
  });

  revalidateTeam(existing.slug);
  if (slug !== existing.slug) revalidateTeam(slug);
  return { success: true };
}

const createForMatchSchema = z.object({
  tournamentId: z.string().min(1),
  name: z.string().min(1, "Name is required"),
  logoUrl: z.string().optional(),
});

export type CreateTeamForMatchResult =
  | { team: { id: string; name: string; logoUrl: string | null } }
  | { error: string };

// Called imperatively from components/admin/team-combobox.tsx — an admin
// typing a team name that doesn't exist yet needs the resulting team back
// synchronously to splice into local match-entry row state, not form
// pending/error semantics. gameId is derived from the tournament, not
// trusted from the client.
export async function createTeamForMatch(formData: FormData): Promise<CreateTeamForMatchResult> {
  await requireAdmin();

  const parsed = createForMatchSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const { tournamentId, name, logoUrl } = parsed.data;

  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    include: { game: true },
  });
  if (!tournament) return { error: "Tournament not found" };

  const slug = await uniqueSlug(name, async (s) => (await prisma.team.count({ where: { slug: s } })) > 0);

  const team = await prisma.$transaction(async (tx) => {
    const created = await tx.team.create({
      data: { name, slug, gameId: tournament.gameId, logoUrl: logoUrl || null },
    });
    await tx.tournamentTeam.create({ data: { tournamentId, teamId: created.id } });
    return created;
  });

  revalidateTournament(tournament.game.slug, tournament.slug);
  return { team: { id: team.id, name: team.name, logoUrl: team.logoUrl } };
}

export async function deleteTeam(
  teamId: string,
  _prevState: ActionState,
  _formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (!team) return { error: "Team not found" };

  try {
    await prisma.team.delete({ where: { id: teamId } });
  } catch {
    return {
      error: "Can't delete this team — it has match history, tournament entries, or roster records attached.",
    };
  }

  revalidateTeam(team.slug);
  redirect("/admin/teams");
}
