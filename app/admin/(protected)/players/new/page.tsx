import { prisma } from "@/lib/prisma";
import { createPlayer } from "@/lib/actions/players";
import { PlayerForm } from "@/components/admin/player-form";

export default async function NewPlayerPage() {
  const games = await prisma.game.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-zinc-900">New player</h1>
      <div className="mt-6">
        <PlayerForm action={createPlayer} games={games} submitLabel="Create player" />
      </div>
    </div>
  );
}
