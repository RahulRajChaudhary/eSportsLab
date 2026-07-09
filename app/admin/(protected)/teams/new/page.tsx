import { prisma } from "@/lib/prisma";
import { createTeam } from "@/lib/actions/teams";
import { TeamForm } from "@/components/admin/team-form";

export default async function NewTeamPage() {
  const games = await prisma.game.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-zinc-900">New team</h1>
      <div className="mt-6">
        <TeamForm action={createTeam} games={games} submitLabel="Create team" />
      </div>
    </div>
  );
}
