"use client";

import { useActionState, useState } from "react";
import { TeamAvatar } from "@/components/team-avatar";
import { TeamCombobox } from "./team-combobox";

type ActionState = { error?: string; success?: boolean };

type TeamOption = { id: string; name: string; logoUrl: string | null };

type Row = {
  teamId: string;
  teamName: string;
  logoUrl: string | null;
  placement: string;
  kills: string;
  customStats: Record<string, string>;
};

const fieldClass =
  "w-20 rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-blue-400";

export function BRMatchEntryForm({
  action,
  tournamentId,
  existingEntries,
  allTeams,
  participantTeamIds,
  customStatColumns,
  showTeamLogos,
}: {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  tournamentId: string;
  existingEntries: {
    teamId: string;
    teamName: string;
    logoUrl: string | null;
    placement: number;
    kills: number;
    customStats: Record<string, string>;
  }[];
  allTeams: TeamOption[];
  participantTeamIds: string[];
  customStatColumns: { key: string; label: string }[];
  showTeamLogos: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const [rows, setRows] = useState<Row[]>(
    existingEntries.map((e) => ({
      teamId: e.teamId,
      teamName: e.teamName,
      logoUrl: e.logoUrl,
      placement: String(e.placement),
      kills: String(e.kills),
      customStats: e.customStats,
    })),
  );

  function updateRow(teamId: string, field: "placement" | "kills", value: string) {
    setRows((rs) => rs.map((r) => (r.teamId === teamId ? { ...r, [field]: value } : r)));
  }

  function updateCustomStat(teamId: string, key: string, value: string) {
    setRows((rs) =>
      rs.map((r) => (r.teamId === teamId ? { ...r, customStats: { ...r.customStats, [key]: value } } : r)),
    );
  }

  function removeRow(teamId: string) {
    setRows((rs) => rs.filter((r) => r.teamId !== teamId));
  }

  function addRow(team: TeamOption) {
    setRows((rs) => [
      ...rs,
      { teamId: team.id, teamName: team.name, logoUrl: team.logoUrl, placement: "", kills: "", customStats: {} },
    ]);
  }

  const rowsPayload = rows
    .filter((r) => r.placement.trim() !== "")
    .map((r) => ({ teamId: r.teamId, placement: r.placement, kills: r.kills, customStats: r.customStats }));

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="rowsJson" value={JSON.stringify(rowsPayload)} />

      <div className="overflow-x-auto rounded-2xl border border-zinc-100 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b border-zinc-100 bg-blue-50/50 text-left text-xs font-semibold uppercase text-zinc-500">
            <tr>
              <th className="px-4 py-3">Team</th>
              <th className="px-4 py-3">Placement</th>
              <th className="px-4 py-3">Kills</th>
              <th className="px-4 py-3 text-center">WWCD</th>
              {customStatColumns.map((col) => (
                <th key={col.key} className="px-4 py-3">
                  {col.label}
                </th>
              ))}
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={5 + customStatColumns.length} className="px-4 py-6 text-center text-zinc-400">
                  No teams added to this match yet.
                </td>
              </tr>
            )}
            {rows.map((row) => (
              <tr key={row.teamId} className="border-b border-zinc-50 last:border-0">
                <td className="px-4 py-3 font-medium">
                  <span className="flex items-center gap-2">
                    {showTeamLogos && <TeamAvatar name={row.teamName} logoUrl={row.logoUrl} size={24} />}
                    {row.teamName}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    min={1}
                    value={row.placement}
                    onChange={(e) => updateRow(row.teamId, "placement", e.target.value)}
                    className={fieldClass}
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    min={0}
                    value={row.kills}
                    onChange={(e) => updateRow(row.teamId, "kills", e.target.value)}
                    className={fieldClass}
                  />
                </td>
                <td className="px-4 py-3 text-center">
                  {row.placement.trim() === "1" && (
                    <span title="Winner Winner Chicken Dinner" aria-label="WWCD" className="text-lg">
                      🏆
                    </span>
                  )}
                </td>
                {customStatColumns.map((col) => (
                  <td key={col.key} className="px-4 py-3">
                    <input
                      type="text"
                      value={row.customStats[col.key] ?? ""}
                      onChange={(e) => updateCustomStat(row.teamId, col.key, e.target.value)}
                      className={fieldClass}
                    />
                  </td>
                ))}
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => removeRow(row.teamId)}
                    className="rounded-lg border border-zinc-200 px-2.5 py-1 text-xs font-semibold text-zinc-500 transition-colors hover:border-red-300 hover:text-red-600"
                  >
                    ✕ Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <TeamCombobox
        tournamentId={tournamentId}
        allTeams={allTeams}
        participantTeamIds={participantTeamIds}
        excludeTeamIds={rows.map((r) => r.teamId)}
        onTeamAdded={addRow}
      />

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.success && <p className="text-sm text-green-600">Saved.</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
      >
        {pending ? "Saving…" : "Save results"}
      </button>
    </form>
  );
}
