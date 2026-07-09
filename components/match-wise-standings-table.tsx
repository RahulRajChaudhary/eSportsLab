import { Fragment } from "react";
import Link from "next/link";
import type { buildMatchWiseStandings } from "@/lib/br-standings";
import { TeamAvatar } from "@/components/team-avatar";

// Sticky left block (rank/team/summary totals) plus a horizontally scrolling
// M1/M2/M3... section — mirrors the standings layout used on Liquipedia and
// esportsamaze BR tournament pages instead of linking out to per-match pages.
const STICKY_COLS = [
  { key: "rank", label: "#", width: 36 },
  { key: "team", label: "Team", width: 176 },
  { key: "matches", label: "M", width: 40 },
  { key: "wwcd", label: "WWCD", width: 60 },
  { key: "pp", label: "PP", width: 52 },
  { key: "finishPoints", label: "Finish Pts", width: 92 },
  { key: "points", label: "Total Pts", width: 92 },
] as const;

// Table uses table-layout: fixed with a matching <colgroup> below — without
// that, the browser's auto layout widens columns to fit content (e.g. "FINISH
// PTS"), which desyncs the actual rendered column edges from these pixel
// values and makes the sticky `left` offsets overlap the wrong cells.
const MATCH_COL_WIDTH = 56;

function stickyOffset(index: number) {
  return STICKY_COLS.slice(0, index).reduce((sum, col) => sum + col.width, 0);
}

export function MatchWiseStandingsTable({
  matches,
  rows,
  showTeamLogos,
}: {
  matches: { id: string; matchNumber: number; mapName: string }[];
  rows: ReturnType<typeof buildMatchWiseStandings>["rows"];
  showTeamLogos: boolean;
}) {
  if (matches.length === 0) {
    return <p className="text-sm text-zinc-400">No matches in this round yet.</p>;
  }

  // table-layout: fixed still needs an explicit total width — left as "auto"
  // some browsers shrink the table to the container instead of the colgroup
  // sum, which silently kills the overflow the horizontal scroll depends on.
  const totalWidth =
    STICKY_COLS.reduce((sum, col) => sum + col.width, 0) + matches.length * 2 * MATCH_COL_WIDTH;

  return (
    <div
      className="scroll-smooth overflow-x-auto rounded-2xl border border-zinc-100 bg-white shadow-sm"
      style={{ scrollbarWidth: "thin", WebkitOverflowScrolling: "touch" }}
    >
      <table className="text-sm" style={{ tableLayout: "fixed", width: totalWidth }}>
        <colgroup>
          {STICKY_COLS.map((col) => (
            <col key={col.key} style={{ width: col.width }} />
          ))}
          {matches.map((m) => (
            <Fragment key={m.id}>
              <col style={{ width: MATCH_COL_WIDTH }} />
              <col style={{ width: MATCH_COL_WIDTH }} />
            </Fragment>
          ))}
        </colgroup>
        <thead className="text-xs font-semibold uppercase text-zinc-500">
          <tr className="border-b border-zinc-100 bg-blue-50/50">
            {STICKY_COLS.map((col, i) => (
              <th
                key={col.key}
                rowSpan={2}
                style={{ left: stickyOffset(i), width: col.width }}
                className={`sticky z-10 bg-blue-50 px-2 py-3 ${
                  col.key === "team" ? "text-left" : "text-right"
                }`}
              >
                {col.label}
              </th>
            ))}
            {matches.map((m) => (
              <th
                key={m.id}
                colSpan={2}
                className="overflow-hidden border-l border-zinc-100 px-2 py-2 text-center"
              >
                <div>M{m.matchNumber}</div>
                <div className="truncate text-[10px] font-normal normal-case text-zinc-400">
                  {m.mapName}
                </div>
              </th>
            ))}
          </tr>
          <tr className="border-b border-zinc-100 bg-blue-50/50">
            {matches.map((m) => (
              <Fragment key={m.id}>
                <th className="border-l border-zinc-100 px-2 py-1 text-right text-[10px]">Plc</th>
                <th className="px-2 py-1 text-right text-[10px]">F.Pts</th>
              </Fragment>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.teamId} className="border-b border-zinc-50 last:border-0">
              <td
                style={{ left: stickyOffset(0), width: STICKY_COLS[0].width }}
                className="sticky z-10 bg-white px-2 py-3 text-right font-semibold text-zinc-400"
              >
                {i + 1}
              </td>
              <td
                style={{ left: stickyOffset(1), width: STICKY_COLS[1].width }}
                className="sticky z-10 truncate bg-white px-2 py-3 font-medium"
              >
                <Link
                  href={`/team/${row.teamSlug}`}
                  className="flex items-center gap-2 hover:text-blue-700 hover:underline"
                >
                  {showTeamLogos && <TeamAvatar name={row.teamName} logoUrl={row.teamLogoUrl} size={20} />}
                  <span className="truncate">{row.teamName}</span>
                </Link>
              </td>
              <td
                style={{ left: stickyOffset(2), width: STICKY_COLS[2].width }}
                className="sticky z-10 bg-white px-2 py-3 text-right text-zinc-600"
              >
                {row.matches}
              </td>
              <td
                style={{ left: stickyOffset(3), width: STICKY_COLS[3].width }}
                className="sticky z-10 bg-white px-2 py-3 text-right text-zinc-600"
              >
                {row.wwcd}
              </td>
              <td
                style={{ left: stickyOffset(4), width: STICKY_COLS[4].width }}
                className="sticky z-10 bg-white px-2 py-3 text-right text-zinc-600"
              >
                {row.placementPoints}
              </td>
              <td
                style={{ left: stickyOffset(5), width: STICKY_COLS[5].width }}
                className="sticky z-10 bg-white px-2 py-3 text-right text-zinc-600"
              >
                {row.finishPoints}
              </td>
              <td
                style={{ left: stickyOffset(6), width: STICKY_COLS[6].width }}
                className="sticky z-10 bg-white px-2 py-3 text-right font-bold text-blue-700"
              >
                {row.points}
              </td>
              {matches.map((m) => {
                const cell = row.perMatch[m.id];
                const isWwcd = cell?.placement === 1;
                return (
                  <Fragment key={m.id}>
                    <td
                      className={`border-l border-zinc-100 px-2 py-3 text-right ${
                        isWwcd ? "bg-amber-50 font-bold text-amber-600" : "text-zinc-600"
                      }`}
                    >
                      {cell ? (
                        isWwcd ? (
                          <span className="inline-flex items-center gap-1">
                            <span aria-hidden>🏆</span>
                            {`#${cell.placement}`}
                          </span>
                        ) : (
                          `#${cell.placement}`
                        )
                      ) : (
                        "—"
                      )}
                    </td>
                    <td
                      className={`px-2 py-3 text-right ${
                        isWwcd ? "bg-amber-50 font-semibold text-amber-600" : "text-zinc-600"
                      }`}
                    >
                      {cell ? cell.finishPoints : "—"}
                    </td>
                  </Fragment>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
