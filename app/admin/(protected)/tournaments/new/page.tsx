import { prisma } from "@/lib/prisma";
import { createTournament } from "@/lib/actions/tournaments";
import { TournamentDetailsForm } from "@/components/admin/tournament-details-form";

export default async function NewTournamentPage() {
  const games = await prisma.game.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-zinc-900">New tournament</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Prize pool, winner, and prize breakdown can be set after creation from the Details tab.
      </p>
      <div className="mt-6">
        <TournamentDetailsForm action={createTournament} games={games} mode="create" submitLabel="Create tournament" />
      </div>
    </div>
  );
}
