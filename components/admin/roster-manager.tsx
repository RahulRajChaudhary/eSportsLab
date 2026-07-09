"use client";

import { useActionState } from "react";
import { addRosterEntry, endRosterEntry } from "@/lib/actions/roster";
import { DeleteButton } from "./delete-button";

type RosterEntry = {
  id: string;
  role: string | null;
  joinedAt: Date;
  leftAt: Date | null;
  player: { id: string; name: string; slug: string };
};

const fieldClass =
  "rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-blue-400";

export function RosterManager({
  teamId,
  eligiblePlayers,
  currentRoster,
  pastRoster,
}: {
  teamId: string;
  eligiblePlayers: { id: string; name: string }[];
  currentRoster: RosterEntry[];
  pastRoster: RosterEntry[];
}) {
  const [state, formAction, pending] = useActionState(addRosterEntry, {});
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">
          Current roster
        </h3>
        {currentRoster.length === 0 ? (
          <p className="text-sm text-zinc-400">No active roster entries.</p>
        ) : (
          <ul className="space-y-2">
            {currentRoster.map((r) => (
              <li
                key={r.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-zinc-100 bg-white px-4 py-2.5 text-sm shadow-sm"
              >
                <span>
                  <span className="font-medium">{r.player.name}</span>
                  {r.role && <span className="ml-2 text-xs text-zinc-400">{r.role}</span>}
                </span>
                <DeleteButton
                  action={endRosterEntry.bind(null, r.id)}
                  confirmMessage={`Mark ${r.player.name} as having left the team?`}
                  label="End"
                  pendingLabel="Ending…"
                  variant="neutral"
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      <form action={formAction} className="flex flex-wrap items-end gap-2 rounded-xl border border-dashed border-zinc-200 p-3">
        <input type="hidden" name="teamId" value={teamId} />
        <div>
          <label className="mb-1 block text-xs font-semibold text-zinc-500">Player</label>
          <select name="playerId" required className={fieldClass} defaultValue="">
            <option value="" disabled>
              Select a player
            </option>
            {eligiblePlayers.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-zinc-500">Role</label>
          <input name="role" placeholder="IGL" className={`${fieldClass} w-28`} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-zinc-500">Joined</label>
          <input name="joinedAt" type="date" defaultValue={today} required className={fieldClass} />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
        >
          {pending ? "Adding…" : "+ Add to roster"}
        </button>
      </form>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      {pastRoster.length > 0 && (
        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Past roster
          </h3>
          <ul className="space-y-1.5">
            {pastRoster.map((r) => (
              <li key={r.id} className="flex items-center justify-between text-sm text-zinc-500">
                <span>
                  {r.player.name} {r.role && <span className="text-xs text-zinc-400">({r.role})</span>}
                </span>
                <span className="text-xs text-zinc-400">
                  left {r.leftAt ? new Date(r.leftAt).toLocaleDateString("en-IN") : ""}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
