"use client";

import Link from "next/link";
import { useActionState } from "react";
import { createBRMatch, deleteBRMatch } from "@/lib/actions/br-matches";
import { DeleteButton } from "./delete-button";

type Match = { id: string; matchNumber: number; mapName: string; entryCount: number };

const fieldClass =
  "rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-blue-400";

export function BRMatchStageSection({
  tournamentId,
  stageId,
  stageName,
  matches,
  nextMatchNumber,
}: {
  tournamentId: string;
  stageId: string;
  stageName: string;
  matches: Match[];
  nextMatchNumber: number;
}) {
  const [state, formAction, pending] = useActionState(createBRMatch, {});

  return (
    <section className="rounded-2xl border border-zinc-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-zinc-900">{stageName}</h3>
        <Link
          href={`/admin/tournaments/${tournamentId}/edit/import?stageId=${stageId}`}
          className="text-xs font-semibold text-blue-700 hover:underline"
        >
          Paste CSV →
        </Link>
      </div>

      {matches.length === 0 ? (
        <p className="mt-3 text-sm text-zinc-400">No matches yet.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {matches.map((m) => (
            <li
              key={m.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-zinc-100 px-4 py-2.5 text-sm"
            >
              <Link
                href={`/admin/tournaments/${tournamentId}/edit/matches/${m.id}`}
                className="font-medium text-blue-700 hover:underline"
              >
                M{m.matchNumber} · {m.mapName}
              </Link>
              <span className="flex items-center gap-3">
                <span className="text-xs text-zinc-400">{m.entryCount} entries</span>
                <DeleteButton
                  action={deleteBRMatch.bind(null, m.id)}
                  confirmMessage={`Delete match M${m.matchNumber}? This removes all its entries too.`}
                />
              </span>
            </li>
          ))}
        </ul>
      )}

      <form action={formAction} className="mt-4 flex flex-wrap items-end gap-2 border-t border-zinc-100 pt-4">
        <input type="hidden" name="stageId" value={stageId} />
        <div>
          <label className="mb-1 block text-xs font-semibold text-zinc-500">Match #</label>
          <input name="matchNumber" type="number" defaultValue={nextMatchNumber} required className={`${fieldClass} w-20`} />
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
          className="rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
        >
          {pending ? "Adding…" : "+ Add match"}
        </button>
      </form>
      {state.error && <p className="mt-2 text-sm text-red-600">{state.error}</p>}
    </section>
  );
}
