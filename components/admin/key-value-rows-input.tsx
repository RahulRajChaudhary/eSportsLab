"use client";

import { useId, useState } from "react";

// Reusable repeatable key/value editor backed by a single hidden JSON input,
// so a Server Action can read it with one `formData.get(name)` — used for
// Team/Player `socials`, PointsSystem `placementPointsJson`, and
// Tournament `prizeBreakdownJson` (as string values; numeric fields parse
// the values server-side).
export function KeyValueRowsInput({
  name,
  keyLabel,
  valueLabel,
  keyPlaceholder,
  valuePlaceholder,
  defaultValue,
}: {
  name: string;
  keyLabel: string;
  valueLabel: string;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
  defaultValue?: Record<string, string> | null;
}) {
  const uid = useId();
  const [rows, setRows] = useState(() => {
    const entries = Object.entries(defaultValue ?? {});
    return entries.length > 0
      ? entries.map(([key, value], i) => ({ id: `${uid}-${i}`, key, value }))
      : [{ id: `${uid}-0`, key: "", value: "" }];
  });

  const json = JSON.stringify(
    Object.fromEntries(rows.filter((r) => r.key.trim() !== "").map((r) => [r.key.trim(), r.value])),
  );

  return (
    <div className="space-y-2">
      <input type="hidden" name={name} value={json} />
      {rows.map((row, i) => (
        <div key={row.id} className="flex gap-2">
          <input
            value={row.key}
            onChange={(e) =>
              setRows((rs) => rs.map((r, idx) => (idx === i ? { ...r, key: e.target.value } : r)))
            }
            placeholder={keyPlaceholder ?? keyLabel}
            aria-label={keyLabel}
            className="w-1/3 rounded-lg border border-zinc-200 px-3 py-1.5 text-sm outline-none focus:border-blue-400"
          />
          <input
            value={row.value}
            onChange={(e) =>
              setRows((rs) => rs.map((r, idx) => (idx === i ? { ...r, value: e.target.value } : r)))
            }
            placeholder={valuePlaceholder ?? valueLabel}
            aria-label={valueLabel}
            className="flex-1 rounded-lg border border-zinc-200 px-3 py-1.5 text-sm outline-none focus:border-blue-400"
          />
          <button
            type="button"
            onClick={() => setRows((rs) => rs.filter((_, idx) => idx !== i))}
            aria-label="Remove row"
            className="rounded-lg px-2 text-zinc-400 hover:bg-zinc-100 hover:text-red-600"
          >
            ✕
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => setRows((rs) => [...rs, { id: `${uid}-${rs.length}-${Date.now()}`, key: "", value: "" }])}
        className="text-xs font-semibold text-blue-700 hover:underline"
      >
        + Add {keyLabel.toLowerCase()}
      </button>
    </div>
  );
}
