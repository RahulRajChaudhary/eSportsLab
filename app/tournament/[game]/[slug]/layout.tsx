import { notFound } from "next/navigation";
import Link from "next/link";
import { getTournamentBySlug } from "@/lib/tournament-data";
import { formatDateRange, formatINR, formatUSD } from "@/lib/format";
import { TournamentTabNav } from "@/components/tournament-tab-nav";

const statusStyles: Record<string, string> = {
  ONGOING: "bg-blue-600 text-white",
  UPCOMING: "bg-blue-50 text-blue-700 border border-blue-200",
  COMPLETED: "bg-zinc-100 text-zinc-500 border border-zinc-200",
};

export default async function TournamentLayout({
  params,
  children,
}: {
  params: Promise<{ game: string; slug: string }>;
  children: React.ReactNode;
}) {
  const { game: gameSlug, slug } = await params;
  const tournament = await getTournamentBySlug(slug);

  if (!tournament || tournament.game.slug !== gameSlug) notFound();

  return (
    <div className="flex flex-1 flex-col text-zinc-900">
      <section className="relative border-b border-zinc-100">
        <div className="relative mx-auto max-w-5xl px-6 pt-12 pb-6">
          <nav aria-label="Breadcrumb" className="mb-3 flex flex-wrap items-center gap-1 text-xs text-zinc-400">
            <Link href="/" className="hover:text-blue-700 hover:underline">
              Home
            </Link>
            <span aria-hidden>/</span>
            <Link href="/tournament" className="hover:text-blue-700 hover:underline">
              Tournaments
            </Link>
            <span aria-hidden>/</span>
            <Link href={`/tournament/${tournament.game.slug}`} className="hover:text-blue-700 hover:underline">
              {tournament.game.name}
            </Link>
            <span aria-hidden>/</span>
            <span className="text-zinc-600">{tournament.name}</span>
          </nav>

          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[tournament.status]}`}
            >
              {tournament.status}
            </span>
            {tournament.tier && (
              <span className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-500">
                {tournament.tier}
              </span>
            )}
          </div>

          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            {tournament.name}
          </h1>

          <a
            href={tournament.sourceLink}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-block text-xs font-medium text-blue-700 hover:underline"
          >
            View source ↗
          </a>

          <div className="mt-5 flex flex-wrap gap-x-8 gap-y-3 text-sm">
            <div>
              <p className="text-xs text-zinc-400">Dates</p>
              <p className="font-medium">{formatDateRange(tournament.startDate, tournament.endDate)}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-400">Prize Pool</p>
              <p className="font-medium">
                {tournament.prizePool ? formatINR(tournament.prizePool) : "TBA"}
                {tournament.prizePoolUsd && (
                  <span className="ml-1 text-xs font-normal text-zinc-400">
                    ({formatUSD(tournament.prizePoolUsd)})
                  </span>
                )}
              </p>
            </div>
            {tournament.region && (
              <div>
                <p className="text-xs text-zinc-400">Region</p>
                <p className="font-medium">{tournament.region}</p>
              </div>
            )}
            {tournament.organizer && (
              <div>
                <p className="text-xs text-zinc-400">Organizer</p>
                <p className="font-medium">{tournament.organizer}</p>
              </div>
            )}
          </div>

          <TournamentTabNav game={gameSlug} slug={slug} />
        </div>
      </section>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-12">{children}</main>
    </div>
  );
}
