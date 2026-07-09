"use client";

import { useActionState, useMemo, useState } from "react";
import Papa from "papaparse";
import { importBRMatchFromCsv } from "@/lib/actions/csv-import";

const fieldClass =
  "rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-blue-400";

type ParsedRow = { teamName: string; placement: string; kills: string };

function findKey(row: Record<string, string>, pattern: RegExp) {
  return Object.keys(row).find((k) => pattern.test(k));
}

export function CsvImportForm({
  stages,
  defaultStageId,
  participantTeamNames,
}: {
  stages: { id: string; name: string }[];
  defaultStageId?: string;
  participantTeamNames: string[];
}) {
  const [raw, setRaw] = useState("");
  const [rows, setRows] = useState<ParsedRow[] | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [state, formAction, pending] = useActionState(importBRMatchFromCsv, {});

  const knownNames = useMemo(
    () => new Set(participantTeamNames.map((n) => n.trim().toLowerCase())),
    [participantTeamNames],
  );

  function handlePreview() {
    setParseError(null);
    const result = Papa.parse<Record<string, string>>(raw.trim(), { header: true, skipEmptyLines: true });
    if (result.errors.length > 0) {
      setParseError(result.errors[0].message);
      setRows(null);
      return;
    }
    const parsed: ParsedRow[] = [];
    for (const row of result.data) {
      const teamKey = findKey(row, /team/i);
      const placementKey = findKey(row, /placement|rank|pos/i);
      const killsKey = findKey(row, /kill/i);
      if (!teamKey || !placementKey || !killsKey) {
        setParseError('Expected columns like "team", "placement", "kills" in the header row.');
        setRows(null);
        return;
      }
      parsed.push({ teamName: row[teamKey], placement: row[placementKey], kills: row[killsKey] });
    }
    setRows(parsed);
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="mb-1 block text-xs font-semibold text-zinc-500">
          Paste CSV — columns: team, placement, kills (header row required)
        </label>
        <textarea
          value={raw}
          onChange={(e) => {
            setRaw(e.target.value);
            setRows(null);
          }}
          rows={8}
          placeholder={"team,placement,kills\nChained Esports,1,12\nNova Blitz,2,8"}
          className="w-full rounded-lg border border-zinc-200 px-3 py-2 font-mono text-xs outline-none focus:border-blue-400"
        />
        <button
          type="button"
          onClick={handlePreview}
          disabled={raw.trim() === ""}
          className="mt-2 rounded-full border border-zinc-200 px-4 py-2 text-xs font-semibold text-zinc-600 transition-colors hover:border-blue-300 hover:text-blue-700 disabled:opacity-50"
        >
          Preview
        </button>
        {parseError && <p className="mt-2 text-sm text-red-600">{parseError}</p>}
      </div>

      {rows && (
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="rowsJson" value={JSON.stringify(rows)} />

          <div className="overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead className="border-b border-zinc-100 bg-blue-50/50 text-left text-xs font-semibold uppercase text-zinc-500">
                <tr>
                  <th className="px-4 py-3">Team</th>
                  <th className="px-4 py-3">Placement</th>
                  <th className="px-4 py-3">Kills</th>
                  <th className="px-4 py-3">Match</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => {
                  const matched = knownNames.has(r.teamName.trim().toLowerCase());
                  return (
                    <tr key={i} className="border-b border-zinc-50 last:border-0">
                      <td className="px-4 py-3 font-medium">{r.teamName}</td>
                      <td className="px-4 py-3">{r.placement}</td>
                      <td className="px-4 py-3">{r.kills}</td>
                      <td className="px-4 py-3">
                        {matched ? (
                          <span className="text-xs font-semibold text-green-600">✓ matched</span>
                        ) : (
                          <span className="text-xs font-semibold text-red-600">✕ no participant found</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-end gap-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-zinc-500">Stage</label>
              <select name="stageId" required defaultValue={defaultStageId ?? ""} className={fieldClass}>
                <option value="" disabled>
                  Select a stage
                </option>
                {stages.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-zinc-500">Match #</label>
              <input name="matchNumber" type="number" required defaultValue={1} className={`${fieldClass} w-20`} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-zinc-500">Map</label>
              <input name="mapName" placeholder="Erangel" required className={fieldClass} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-zinc-500">Scheduled</label>
              <input name="scheduledAt" type="datetime-local" className={fieldClass} />
            </div>
            <button
              type="submit"
              disabled={pending}
              className="rounded-full bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
            >
              {pending ? "Importing…" : "Confirm import"}
            </button>
          </div>

          {state.error && <p className="text-sm text-red-600">{state.error}</p>}
          {state.success && <p className="text-sm text-green-600">Imported.</p>}
        </form>
      )}
    </div>
  );
}
