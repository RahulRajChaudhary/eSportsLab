import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminPlayersList() {
  const players = await prisma.player.findMany({
    include: {
      game: true,
      rosterHistory: { where: { leftAt: null }, include: { team: true }, take: 1 },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Players</h1>
        <Link
          href="/admin/players/new"
          className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          + New player
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b border-zinc-100 bg-blue-50/50 text-left text-xs font-semibold uppercase text-zinc-500">
            <tr>
              <th className="px-4 py-3">IGN</th>
              <th className="px-4 py-3">Game</th>
              <th className="px-4 py-3">Current team</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {players.map((player) => (
              <tr key={player.id} className="border-b border-zinc-50 last:border-0">
                <td className="px-4 py-3 font-medium">{player.name}</td>
                <td className="px-4 py-3 text-zinc-500">{player.game.name}</td>
                <td className="px-4 py-3 text-zinc-500">
                  {player.rosterHistory[0]?.team.name ?? "Free agent"}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/players/${player.id}/edit`}
                    className="text-xs font-semibold text-blue-700 hover:underline"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
            {players.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-zinc-400">
                  No players yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
