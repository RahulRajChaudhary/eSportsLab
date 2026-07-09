import Link from "next/link";
import { buildMatchWiseStandings } from "@/lib/br-standings";
import { MatchWiseStandingsTable } from "@/components/match-wise-standings-table";
import { StageDescriptionDisclosure } from "@/components/stage-description-disclosure";
import type { TournamentWithDetails } from "@/lib/tournament-data";

type Stage = TournamentWithDetails["stages"][number];
type GroupStandingsRow = TournamentWithDetails["groupStandingsRows"][number];

function formatMatchTime(scheduledAt: Date | null) {
  if (!scheduledAt) return "TBA";
  return scheduledAt.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function StageSection({
  stage,
  isBR,
  pointsPerKill,
  groupedStandings,
  showTeamLogos,
}: {
  stage: Stage;
  isBR: boolean;
  pointsPerKill: number;
  groupedStandings: Map<string, GroupStandingsRow[]>;
  showTeamLogos: boolean;
}) {
  const matchWise = isBR ? buildMatchWiseStandings(stage.brMatches, pointsPerKill) : null;

  return (
    <div className="space-y-4">
      {stage.description ? (
        <StageDescriptionDisclosure name={stage.name} html={stage.description} />
      ) : (
        <h3 className="text-sm font-semibold text-zinc-700">{stage.name}</h3>
      )}

      {matchWise ? (
        <MatchWiseStandingsTable matches={matchWise.matches} rows={matchWise.rows} showTeamLogos={showTeamLogos} />
      ) : groupedStandings.size === 0 ? (
        <p className="text-sm text-zinc-400">No standings yet.</p>
      ) : (
        <div className="space-y-4">
          {[...groupedStandings.entries()].map(([groupName, rows]) => (
            <div key={groupName}>
              <h4 className="mb-2 text-xs font-semibold text-zinc-500">Group {groupName}</h4>
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
                      .sort((a, b) => b.wins - a.wins || b.mapDiff - a.mapDiff || b.roundDiff - a.roundDiff)
                      .map((row, i) => (
                        <tr key={row.id} className="border-b border-zinc-50 last:border-0">
                          <td className="px-4 py-3 font-semibold text-zinc-400">{i + 1}</td>
                          <td className="px-4 py-3 font-medium">
                            <Link href={`/team/${row.team.slug}`} className="hover:text-blue-700 hover:underline">
                              {row.team.name}
                            </Link>
                          </td>
                          <td className="px-4 py-3 text-right text-zinc-600">{row.wins}</td>
                          <td className="px-4 py-3 text-right text-zinc-600">{row.losses}</td>
                          <td className="px-4 py-3 text-right text-zinc-600">
                            {row.mapDiff > 0 ? `+${row.mapDiff}` : row.mapDiff}
                          </td>
                          <td className="px-4 py-3 text-right text-zinc-600">
                            {row.roundDiff > 0 ? `+${row.roundDiff}` : row.roundDiff}
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-blue-700">{row.points}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {!isBR && (
        <ul className="space-y-2">
          {stage.h2hMatches.map((m) => (
            <li key={m.id} className="rounded-xl border border-zinc-100 bg-white px-4 py-3 text-sm shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <span className="font-medium">
                  <Link href={`/team/${m.teamA.slug}`} className="hover:text-blue-700 hover:underline">
                    {m.teamA.name}
                  </Link>{" "}
                  vs{" "}
                  <Link href={`/team/${m.teamB.slug}`} className="hover:text-blue-700 hover:underline">
                    {m.teamB.name}
                  </Link>{" "}
                  (Bo{m.bestOf})
                </span>
                <span className="text-zinc-400">{formatMatchTime(m.scheduledAt)}</span>
              </div>
              {m.mapScores.length > 0 && (
                <p className="mt-1 text-xs text-zinc-500">
                  {m.mapScores.map((ms) => `${ms.mapName} ${ms.scoreA}-${ms.scoreB}`).join(" · ")}
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
