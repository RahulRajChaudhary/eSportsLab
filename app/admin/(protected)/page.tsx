import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboard() {
  const session = await auth();

  const [teamCount, playerCount, tournamentCount, liveCount, ongoingTournaments] = await Promise.all([
    prisma.team.count(),
    prisma.player.count(),
    prisma.tournament.count(),
    prisma.tournament.count({ where: { status: "ONGOING" } }),
    prisma.tournament.findMany({
      where: { status: "ONGOING" },
      include: { game: true },
      orderBy: { startDate: "asc" },
    }),
  ]);

  const tiles = [
    { label: "Teams", value: teamCount, href: "/admin/teams" },
    { label: "Players", value: playerCount, href: "/admin/players" },
    { label: "Tournaments", value: tournamentCount, href: "/admin/tournaments" },
    { label: "Live now", value: liveCount, href: "/admin/tournaments?status=ONGOING" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Admin</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Signed in as {session?.user?.email} · {session?.user?.role}
      </p>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {tiles.map((tile) => (
          <Link
            key={tile.label}
            href={tile.href}
            className="rounded-2xl border border-zinc-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <p className="text-2xl font-bold text-blue-600">{tile.value}</p>
            <p className="mt-1 text-sm text-zinc-500">{tile.label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-10">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-400">
          Ongoing Tournaments
        </h2>
        {ongoingTournaments.length === 0 ? (
          <p className="text-sm text-zinc-400">No tournaments in progress.</p>
        ) : (
          <ul className="space-y-2">
            {ongoingTournaments.map((t) => (
              <li
                key={t.id}
                className="flex items-center justify-between rounded-xl border border-zinc-100 bg-white px-4 py-3 shadow-sm"
              >
                <div>
                  <p className="font-semibold">{t.name}</p>
                  <p className="text-xs text-zinc-400">{t.game.name}</p>
                </div>
                <Link
                  href={`/admin/tournaments/${t.id}/edit`}
                  className="text-xs font-semibold text-blue-700 hover:underline"
                >
                  Edit →
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
