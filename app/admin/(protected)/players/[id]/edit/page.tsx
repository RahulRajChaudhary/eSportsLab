import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updatePlayer, deletePlayer } from "@/lib/actions/players";
import { PlayerForm } from "@/components/admin/player-form";
import { DeleteButton } from "@/components/admin/delete-button";

export default async function EditPlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [player, games] = await Promise.all([
    prisma.player.findUnique({
      where: { id },
      include: {
        rosterHistory: { include: { team: true }, orderBy: { joinedAt: "asc" } },
      },
    }),
    prisma.game.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!player) notFound();

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">{player.name}</h1>
        <DeleteButton
          action={deletePlayer.bind(null, player.id)}
          confirmMessage={`Delete ${player.name}? This can't be undone.`}
        />
      </div>

      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-400">Details</h2>
        <PlayerForm
          action={updatePlayer.bind(null, player.id)}
          games={games}
          submitLabel="Save changes"
          defaultValues={{
            name: player.name,
            slug: player.slug,
            gameId: player.gameId,
            realName: player.realName,
            imageUrl: player.imageUrl,
            country: player.country,
            socials: (player.socials as Record<string, string> | null) ?? null,
          }}
        />
      </section>

      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-400">
          Team history
        </h2>
        <p className="mb-3 text-xs text-zinc-400">
          Add or end roster entries from the team&apos;s edit page.
        </p>
        {player.rosterHistory.length === 0 ? (
          <p className="text-sm text-zinc-400">No teams yet.</p>
        ) : (
          <ul className="space-y-2">
            {player.rosterHistory.map((r) => (
              <li
                key={r.id}
                className="flex items-center justify-between rounded-xl border border-zinc-100 bg-white px-4 py-2.5 text-sm shadow-sm"
              >
                <Link
                  href={`/admin/teams/${r.team.id}/edit`}
                  className="font-medium text-blue-700 hover:underline"
                >
                  {r.team.name}
                </Link>
                <span className="text-xs text-zinc-400">
                  {r.role ?? "—"} · {r.leftAt ? "past" : "current"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
