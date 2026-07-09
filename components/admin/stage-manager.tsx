"use client";

import { useActionState } from "react";
import { addStage, updateStage, deleteStage } from "@/lib/actions/tournaments";
import { DeleteButton } from "./delete-button";
import { StageDescriptionEditor } from "./stage-description-editor";

type Stage = {
  id: string;
  name: string;
  order: number;
  description: string | null;
  startDate: Date | null;
  endDate: Date | null;
  matchCount: number;
};

const fieldClass =
  "rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-blue-400";

function toDateInputValue(d: Date | null) {
  return d ? d.toISOString().slice(0, 10) : "";
}

function StageRow({ stage }: { stage: Stage }) {
  const [state, formAction, pending] = useActionState(updateStage.bind(null, stage.id), {});

  return (
    <li className="rounded-xl border border-zinc-100 bg-white p-4 shadow-sm">
      <form action={formAction} className="space-y-3">
        <div className="flex flex-wrap items-end gap-2">
          <div>
            <label className="mb-1 block text-xs font-semibold text-zinc-500">Name</label>
            <input name="name" defaultValue={stage.name} required className={fieldClass} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-zinc-500">Order</label>
            <input name="order" type="number" defaultValue={stage.order} className={`${fieldClass} w-20`} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-zinc-500">Start</label>
            <input name="startDate" type="date" defaultValue={toDateInputValue(stage.startDate)} className={fieldClass} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-zinc-500">End</label>
            <input name="endDate" type="date" defaultValue={toDateInputValue(stage.endDate)} className={fieldClass} />
          </div>
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-600 transition-colors hover:border-blue-300 hover:text-blue-700 disabled:opacity-50"
          >
            {pending ? "Saving…" : "Save"}
          </button>
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-zinc-500">Description</label>
          <StageDescriptionEditor name="description" defaultValue={stage.description} />
        </div>
      </form>
      <div className="mt-3">
        <DeleteButton
          action={deleteStage.bind(null, stage.id)}
          confirmMessage={`Delete stage "${stage.name}"?`}
          label="Delete"
        />
      </div>
      <p className="mt-2 text-xs text-zinc-400">{stage.matchCount} match(es) recorded</p>
      {state.error && <p className="mt-1 text-xs text-red-600">{state.error}</p>}
    </li>
  );
}

export function StageManager({ tournamentId, stages }: { tournamentId: string; stages: Stage[] }) {
  const [state, formAction, pending] = useActionState(addStage, {});

  return (
    <div className="space-y-4">
      {stages.length === 0 ? (
        <p className="text-sm text-zinc-400">No stages yet.</p>
      ) : (
        <ul className="space-y-3">
          {stages.map((stage) => (
            <StageRow key={stage.id} stage={stage} />
          ))}
        </ul>
      )}

      <form
        action={formAction}
        className="space-y-3 rounded-xl border border-dashed border-zinc-200 p-3"
      >
        <input type="hidden" name="tournamentId" value={tournamentId} />
        <div className="flex flex-wrap items-end gap-2">
          <div>
            <label className="mb-1 block text-xs font-semibold text-zinc-500">Name</label>
            <input name="name" placeholder="Qualifiers" required className={fieldClass} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-zinc-500">Order</label>
            <input name="order" type="number" defaultValue={stages.length} className={`${fieldClass} w-20`} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-zinc-500">Start</label>
            <input name="startDate" type="date" className={fieldClass} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-zinc-500">End</label>
            <input name="endDate" type="date" className={fieldClass} />
          </div>
          <button
            type="submit"
            disabled={pending}
            className="rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            {pending ? "Adding…" : "+ Add stage"}
          </button>
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-zinc-500">Description (optional)</label>
          <StageDescriptionEditor name="description" />
        </div>
      </form>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
    </div>
  );
}
