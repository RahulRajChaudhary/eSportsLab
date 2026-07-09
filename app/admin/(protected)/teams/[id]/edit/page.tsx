import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateTeam, deleteTeam } from "@/lib/actions/teams";
import { TeamForm } from "@/components/admin/team-form";
import { RosterManager } from "@/components/admin/roster-manager";
import { DeleteButton } from "@/components/admin/delete-button";

export default async function EditTeamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [team, games] = await Promise.all([
    prisma.team.findUnique({
      where: { id },
      include: {
        rosterHistory: { include: { player: true }, orderBy: { joinedAt: "asc" } },
      },
    }),
    prisma.game.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!team) notFound();

  const currentRoster = team.rosterHistory.filter((r) => r.leftAt === null);
  const pastRoster = team.rosterHistory
    .filter((r) => r.leftAt !== null)
    .sort((a, b) => b.joinedAt.getTime() - a.joinedAt.getTime());

  const activePlayerIds = new Set(currentRoster.map((r) => r.player.id));
  const eligiblePlayers = await prisma.player.findMany({
    where: { gameId: team.gameId, id: { notIn: [...activePlayerIds] } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">{team.name}</h1>
        <DeleteButton
          action={deleteTeam.bind(null, team.id)}
          confirmMessage={`Delete ${team.name}? This can't be undone.`}
        />
      </div>

      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-400">Details</h2>
        <TeamForm
          action={updateTeam.bind(null, team.id)}
          games={games}
          submitLabel="Save changes"
          defaultValues={{
            name: team.name,
            slug: team.slug,
            gameId: team.gameId,
            region: team.region,
            logoUrl: team.logoUrl,
            socials: (team.socials as Record<string, string> | null) ?? null,
          }}
        />
      </section>

      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-400">Roster</h2>
        <RosterManager
          teamId={team.id}
          eligiblePlayers={eligiblePlayers}
          currentRoster={currentRoster}
          pastRoster={pastRoster}
        />
      </section>
    </div>
  );
}
