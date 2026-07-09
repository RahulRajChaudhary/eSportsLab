import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminTeamsList() {
  const teams = await prisma.team.findMany({
    include: { game: true, _count: { select: { rosterHistory: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Teams</h1>
        <Link
          href="/admin/teams/new"
          className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          + New team
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b border-zinc-100 bg-blue-50/50 text-left text-xs font-semibold uppercase text-zinc-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Game</th>
              <th className="px-4 py-3">Region</th>
              <th className="px-4 py-3 text-right">Roster entries</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {teams.map((team) => (
              <tr key={team.id} className="border-b border-zinc-50 last:border-0">
                <td className="px-4 py-3 font-medium">{team.name}</td>
                <td className="px-4 py-3 text-zinc-500">{team.game.name}</td>
                <td className="px-4 py-3 text-zinc-500">{team.region ?? "—"}</td>
                <td className="px-4 py-3 text-right text-zinc-500">{team._count.rosterHistory}</td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/teams/${team.id}/edit`}
                    className="text-xs font-semibold text-blue-700 hover:underline"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
            {teams.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-zinc-400">
                  No teams yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
