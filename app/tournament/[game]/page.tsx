import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDateRange } from "@/lib/format";

export const revalidate = 60;

const statusStyles: Record<string, string> = {
  ONGOING: "bg-blue-600 text-white",
  UPCOMING: "bg-blue-50 text-blue-700 border border-blue-200",
  COMPLETED: "bg-zinc-100 text-zinc-500 border border-zinc-200",
};

export default async function GameTournamentsList({
  params,
}: {
  params: Promise<{ game: string }>;
}) {
  const { game: gameSlug } = await params;

  const game = await prisma.game.findUnique({ where: { slug: gameSlug } });
  if (!game) notFound();

  const tournaments = await prisma.tournament.findMany({
    where: { gameId: game.id },
    orderBy: [{ startDate: "desc" }],
  });

  return (
    <div className="flex flex-1 flex-col text-zinc-900">
      <section className="border-b border-zinc-100">
        <div className="mx-auto max-w-5xl px-6 pt-12 pb-6">
          <Link href="/tournament" className="text-sm font-medium text-blue-700 hover:underline">
            ← All games
          </Link>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            {game.name} Tournaments
          </h1>
        </div>
      </section>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-12">
        {tournaments.length === 0 ? (
          <p className="text-sm text-zinc-400">No tournaments yet.</p>
        ) : (
          <ul className="space-y-3">
            {tournaments.map((t) => (
              <li key={t.id}>
                <Link
                  href={`/tournament/${game.slug}/${t.slug}`}
                  className="block rounded-2xl border border-zinc-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-semibold">{t.name}</span>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[t.status] ?? statusStyles.COMPLETED}`}
                    >
                      {t.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-zinc-500">
                    {[t.tier, t.region, t.organizer].filter(Boolean).join(" · ")}
                  </p>
                  <p className="mt-1 text-xs text-zinc-400">
                    {formatDateRange(t.startDate, t.endDate)}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
