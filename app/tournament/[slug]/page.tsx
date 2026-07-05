import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { aggregateBRStandings, type BRStandingsRow } from "@/lib/br-standings";
import { formatDateRange, formatINR } from "@/lib/format";
import { TeamAvatar } from "@/components/team-avatar";
import { TournamentCalendar } from "@/components/tournament-calendar";

export const revalidate = 60;

const statusStyles: Record<string, string> = {
  ONGOING: "bg-blue-600 text-white",
  UPCOMING: "bg-blue-50 text-blue-700 border border-blue-200",
  COMPLETED: "bg-zinc-100 text-zinc-500 border border-zinc-200",
};

type TabKey = "overview" | "league" | "finals" | "stats";

const TABS: { key: TabKey; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "league", label: "League" },
  { key: "finals", label: "Grand Finals" },
  { key: "stats", label: "Stats" },
];

function formatMatchTime(scheduledAt: Date | null) {
  if (!scheduledAt) return "TBA";
  return scheduledAt.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

// Stages carry their own admin-set dates (independent of individual match
// schedules) so the calendar can show a round's window before any matches
// are entered — derive a status from "today" vs that window.
function stageStatus(stage: { startDate: Date | null; endDate: Date | null }) {
  if (!stage.startDate || !stage.endDate) return "TBA";
  const now = new Date();
  if (now < stage.startDate) return "UPCOMING";
  if (now > stage.endDate) return "COMPLETED";
  return "ONGOING";
}

function StandingsTable({ rows }: { rows: BRStandingsRow[] }) {
  if (rows.length === 0) {
    return <p className="text-sm text-zinc-400">No matches played yet.</p>;
  }
  return (
    <div className="overflow-x-auto rounded-2xl border border-zinc-100 bg-white shadow-sm">
      <table className="w-full text-sm">
        <thead className="border-b border-zinc-100 bg-blue-50/50 text-left text-xs font-semibold uppercase text-zinc-500">
          <tr>
            <th className="px-4 py-3">#</th>
            <th className="px-4 py-3">Team</th>
            <th className="px-4 py-3 text-right">Matches</th>
            <th className="px-4 py-3 text-right">WWCD</th>
            <th className="px-4 py-3 text-right">Kills</th>
            <th className="px-4 py-3 text-right">Points</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={row.teamId}
              className={`border-b border-zinc-50 last:border-0 ${i < 3 ? "bg-blue-50/30" : ""}`}
            >
              <td className="px-4 py-3 font-semibold text-zinc-400">{i + 1}</td>
              <td className="px-4 py-3 font-medium">{row.teamName}</td>
              <td className="px-4 py-3 text-right text-zinc-600">{row.matches}</td>
              <td className="px-4 py-3 text-right text-zinc-600">{row.wwcd}</td>
              <td className="px-4 py-3 text-right text-zinc-600">{row.kills}</td>
              <td className="px-4 py-3 text-right font-bold text-blue-700">{row.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function TournamentDetail({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { slug } = await params;
  const { tab: rawTab } = await searchParams;
  const tab: TabKey = TABS.some((t) => t.key === rawTab)
    ? (rawTab as TabKey)
    : "overview";

  const tournament = await prisma.tournament.findUnique({
    where: { slug },
    include: {
      game: true,
      winner: true,
      runnerUp: true,
      stages: {
        orderBy: { order: "asc" },
        include: {
          brMatches: {
            orderBy: { matchNumber: "asc" },
            include: { entries: { include: { team: true } } },
          },
          h2hMatches: {
            orderBy: { scheduledAt: "asc" },
            include: {
              teamA: true,
              teamB: true,
              mapScores: { orderBy: { order: "asc" } },
            },
          },
        },
      },
      groupStandingsRows: { include: { team: true } },
    },
  });

  if (!tournament) notFound();

  const isBR = tournament.game.formatType === "BR";
  const stages = tournament.stages;
  const finalStage = stages.length > 0 ? stages[stages.length - 1] : null;
  const leagueStages = finalStage ? stages.slice(0, -1) : [];

  const groupedStandings = new Map<string, typeof tournament.groupStandingsRows>();
  for (const row of tournament.groupStandingsRows) {
    const list = groupedStandings.get(row.groupName) ?? [];
    list.push(row);
    groupedStandings.set(row.groupName, list);
  }

  function renderStageSection(stage: (typeof stages)[number]) {
    const standings = isBR
      ? aggregateBRStandings(stage.brMatches.flatMap((m) => m.entries))
      : [];

    return (
      <div key={stage.id} className="space-y-4">
        <h3 className="text-sm font-semibold text-zinc-700">{stage.name}</h3>

        {isBR ? (
          <StandingsTable rows={standings} />
        ) : groupedStandings.size === 0 ? (
          <p className="text-sm text-zinc-400">No standings yet.</p>
        ) : (
          <div className="space-y-4">
            {[...groupedStandings.entries()].map(([groupName, rows]) => (
              <div key={groupName}>
                <h4 className="mb-2 text-xs font-semibold text-zinc-500">
                  Group {groupName}
                </h4>
                <div className="overflow-x-auto rounded-2xl border border-zinc-100 bg-white shadow-sm">
                  <table className="w-full text-sm">
                    <thead className="border-b border-zinc-100 bg-blue-50/50 text-left text-xs font-semibold uppercase text-zinc-500">
                      <tr>
                        <th className="px-4 py-3">#</th>
                        <th className="px-4 py-3">Team</th>
                        <th className="px-4 py-3 text-right">W</th>
                        <th className="px-4 py-3 text-right">L</th>
                        <th className="px-4 py-3 text-right">Map Diff</th>
                        <th className="px-4 py-3 text-right">Round Diff</th>
                        <th className="px-4 py-3 text-right">Points</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows
                        .slice()
                        .sort(
                          (a, b) =>
                            b.wins - a.wins ||
                            b.mapDiff - a.mapDiff ||
                            b.roundDiff - a.roundDiff,
                        )
                        .map((row, i) => (
                          <tr key={row.id} className="border-b border-zinc-50 last:border-0">
                            <td className="px-4 py-3 font-semibold text-zinc-400">{i + 1}</td>
                            <td className="px-4 py-3 font-medium">{row.team.name}</td>
                            <td className="px-4 py-3 text-right text-zinc-600">{row.wins}</td>
                            <td className="px-4 py-3 text-right text-zinc-600">{row.losses}</td>
                            <td className="px-4 py-3 text-right text-zinc-600">
                              {row.mapDiff > 0 ? `+${row.mapDiff}` : row.mapDiff}
                            </td>
                            <td className="px-4 py-3 text-right text-zinc-600">
                              {row.roundDiff > 0 ? `+${row.roundDiff}` : row.roundDiff}
                            </td>
                            <td className="px-4 py-3 text-right font-bold text-blue-700">
                              {row.points}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}

        {isBR ? (
          <ul className="space-y-2">
            {stage.brMatches.map((m) => (
              <li
                key={m.id}
                className="flex items-center justify-between rounded-xl border border-zinc-100 bg-white px-4 py-3 text-sm shadow-sm"
              >
                <span className="font-medium">
                  Match {m.matchNumber} · {m.mapName}
                </span>
                <span className="text-zinc-400">{formatMatchTime(m.scheduledAt)}</span>
              </li>
            ))}
            {stage.brMatches.length === 0 && (
              <p className="text-sm text-zinc-400">No matches in this round yet.</p>
            )}
          </ul>
        ) : (
          <ul className="space-y-2">
            {stage.h2hMatches.map((m) => (
              <li
                key={m.id}
                className="rounded-xl border border-zinc-100 bg-white px-4 py-3 text-sm shadow-sm"
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="font-medium">
                    {m.teamA.name} vs {m.teamB.name} (Bo{m.bestOf})
                  </span>
                  <span className="text-zinc-400">{formatMatchTime(m.scheduledAt)}</span>
                </div>
                {m.mapScores.length > 0 && (
                  <p className="mt-1 text-xs text-zinc-500">
                    {m.mapScores
                      .map((ms) => `${ms.mapName} ${ms.scoreA}-${ms.scoreB}`)
                      .join(" · ")}
                  </p>
                )}
              </li>
            ))}
            {stage.h2hMatches.length === 0 && (
              <p className="text-sm text-zinc-400">No matches in this round yet.</p>
            )}
          </ul>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col text-zinc-900">
      <section className="relative border-b border-zinc-100">
        <div className="relative mx-auto max-w-5xl px-6 pt-12 pb-6">
          <Link
            href={`/${tournament.game.slug}`}
            className="text-sm font-medium text-blue-700 hover:underline"
          >
            ← {tournament.game.name}
          </Link>

          <div className="mt-3 flex flex-wrap items-center gap-3">
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

          <nav className="mt-6 flex gap-1 border-b border-zinc-100">
            {TABS.map((t) => (
              <Link
                key={t.key}
                href={t.key === "overview" ? `/tournament/${slug}` : `/tournament/${slug}?tab=${t.key}`}
                className={`-mb-px rounded-t-lg border-b-2 px-4 py-2 text-sm font-medium ${
                  tab === t.key
                    ? "border-blue-600 text-blue-700"
                    : "border-transparent text-zinc-500 hover:text-zinc-700"
                }`}
              >
                {t.label}
              </Link>
            ))}
          </nav>
        </div>
      </section>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-12">
        {tab === "overview" && (
          <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
            <div className="space-y-10">
              <section>
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-400">
                  Format
                </h2>
                {stages.length === 0 ? (
                  <p className="text-sm text-zinc-400">Format not announced yet.</p>
                ) : (
                  <ol className="relative space-y-6 border-l-2 border-blue-100 pl-6">
                    {stages.map((stage) => {
                      const st = stageStatus(stage);
                      return (
                        <li key={stage.id} className="relative">
                          <span className="absolute top-1 -left-[1.9rem] h-3 w-3 rounded-full border-2 border-white bg-blue-500 shadow" />
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold text-zinc-900">{stage.name}</span>
                            {st !== "TBA" && (
                              <span
                                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusStyles[st] ?? statusStyles.COMPLETED}`}
                              >
                                {st}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-zinc-500">
                            {formatDateRange(stage.startDate, stage.endDate)}
                          </p>
                        </li>
                      );
                    })}
                  </ol>
                )}
              </section>

              <section>
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-400">
                  Calendar
                </h2>
                <TournamentCalendar stages={stages} />
              </section>
            </div>

            <section className="overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-sm">
              <div className="h-16 bg-gradient-to-r from-blue-600 to-cyan-500" />
              <div className="px-5 pb-5">
                <div className="-mt-8 mb-4 flex items-end gap-3">
                  <div className="rounded-full border-4 border-white shadow-md">
                    <TeamAvatar name={tournament.name} logoUrl={tournament.game.logoUrl} size={56} />
                  </div>
                  <div className="pb-1">
                    <p className="font-semibold leading-tight">{tournament.name}</p>
                    <p className="text-xs text-zinc-400">{tournament.game.name}</p>
                  </div>
                </div>

                <dl className="space-y-3 text-sm">
                  {tournament.tier && (
                    <div className="flex items-center justify-between gap-4">
                      <dt className="flex items-center gap-1.5 text-zinc-400">
                        <span aria-hidden>🏷️</span> Event Tier
                      </dt>
                      <dd className="font-medium">{tournament.tier}</dd>
                    </div>
                  )}
                  {tournament.eventType && (
                    <div className="flex items-center justify-between gap-4">
                      <dt className="flex items-center gap-1.5 text-zinc-400">
                        <span aria-hidden>🖥️</span> Type
                      </dt>
                      <dd className="font-medium">{tournament.eventType}</dd>
                    </div>
                  )}
                  <div className="flex items-center justify-between gap-4">
                    <dt className="flex items-center gap-1.5 text-zinc-400">
                      <span aria-hidden>🎮</span> Mode
                    </dt>
                    <dd className="font-medium">{isBR ? "Squads TPP" : "5v5"}</dd>
                  </div>
                  {tournament.region && (
                    <div className="flex items-center justify-between gap-4">
                      <dt className="flex items-center gap-1.5 text-zinc-400">
                        <span aria-hidden>📍</span> Location
                      </dt>
                      <dd className="font-medium">{tournament.region}</dd>
                    </div>
                  )}
                  <div className="flex items-center justify-between gap-4">
                    <dt className="flex items-center gap-1.5 text-zinc-400">
                      <span aria-hidden>💰</span> Total Prize Pool
                    </dt>
                    <dd className="font-medium">
                      {tournament.prizePool ? formatINR(tournament.prizePool) : "TBA"}
                    </dd>
                  </div>
                  {tournament.organizer && (
                    <div className="flex items-center justify-between gap-4">
                      <dt className="flex items-center gap-1.5 text-zinc-400">
                        <span aria-hidden>🏢</span> Organizer
                      </dt>
                      <dd className="font-medium">{tournament.organizer}</dd>
                    </div>
                  )}
                  <div className="flex items-center justify-between gap-4">
                    <dt className="flex items-center gap-1.5 text-zinc-400">
                      <span aria-hidden>📅</span> Dates
                    </dt>
                    <dd className="font-medium">
                      {formatDateRange(tournament.startDate, tournament.endDate)}
                    </dd>
                  </div>

                  {tournament.status === "COMPLETED" && (
                    <>
                      <div className="flex items-center justify-between gap-4 border-t border-zinc-100 pt-3">
                        <dt className="text-zinc-400">Winner</dt>
                        <dd className="flex items-center gap-2 font-semibold text-amber-700">
                          {tournament.winner ? (
                            <>
                              <span aria-hidden>🏆</span>
                              {tournament.winner.name}
                            </>
                          ) : (
                            "TBA"
                          )}
                        </dd>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <dt className="text-zinc-400">Runner Up</dt>
                        <dd className="font-medium">{tournament.runnerUp?.name ?? "TBA"}</dd>
                      </div>
                    </>
                  )}
                </dl>
              </div>
            </section>
          </div>
        )}

        {tab === "league" && (
          <div className="space-y-10">
            {leagueStages.length === 0 ? (
              <p className="text-sm text-zinc-400">
                No league rounds — this tournament goes straight to Grand Finals.
              </p>
            ) : (
              leagueStages.map((stage) => renderStageSection(stage))
            )}
          </div>
        )}

        {tab === "finals" && (
          <div>
            {finalStage ? (
              renderStageSection(finalStage)
            ) : (
              <p className="text-sm text-zinc-400">Grand Finals not scheduled yet.</p>
            )}
          </div>
        )}

        {tab === "stats" && (
          <p className="text-sm text-zinc-400">
            Tournament statistics are coming in a later release.
          </p>
        )}
      </main>
    </div>
  );
}
