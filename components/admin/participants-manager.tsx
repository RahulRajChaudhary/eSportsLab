"use client";

import { useActionState } from "react";
import { addParticipant, removeParticipant } from "@/lib/actions/tournaments";
import { DeleteButton } from "./delete-button";

type Participant = { id: string; groupName: string | null; team: { id: string; name: string } };

const fieldClass =
  "rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-blue-400";

export function ParticipantsManager({
  tournamentId,
  participants,
  eligibleTeams,
}: {
  tournamentId: string;
  participants: Participant[];
  eligibleTeams: { id: string; name: string }[];
}) {
  const [state, formAction, pending] = useActionState(addParticipant, {});

  return (
    <div className="space-y-4">
      {participants.length === 0 ? (
        <p className="text-sm text-zinc-400">No participants yet.</p>
      ) : (
        <ul className="space-y-2">
          {participants.map((p) => (
            <li
              key={p.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-zinc-100 bg-white px-4 py-2.5 text-sm shadow-sm"
            >
              <span>
                <span className="font-medium">{p.team.name}</span>
                {p.groupName && <span className="ml-2 text-xs text-zinc-400">Group {p.groupName}</span>}
              </span>
              <DeleteButton
                action={removeParticipant.bind(null, p.id)}
                confirmMessage={`Remove ${p.team.name} from this tournament?`}
                label="Remove"
              />
            </li>
          ))}
        </ul>
      )}

      <form
        action={formAction}
        className="flex flex-wrap items-end gap-2 rounded-xl border border-dashed border-zinc-200 p-3"
      >
        <input type="hidden" name="tournamentId" value={tournamentId} />
        <div>
          <label className="mb-1 block text-xs font-semibold text-zinc-500">Team</label>
          <select name="teamId" required defaultValue="" className={fieldClass}>
            <option value="" disabled>
              Select a team
            </option>
            {eligibleTeams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-zinc-500">Group</label>
          <input name="groupName" placeholder="A" className={`${fieldClass} w-20`} />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
        >
          {pending ? "Adding…" : "+ Add participant"}
        </button>
      </form>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
    </div>
  );
}
