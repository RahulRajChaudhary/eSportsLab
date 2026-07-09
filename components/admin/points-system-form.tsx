"use client";

import { useActionState } from "react";
import { KeyValueRowsInput } from "./key-value-rows-input";

type ActionState = { error?: string; success?: boolean };

export function PointsSystemForm({
  action,
  defaultValues,
}: {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  defaultValues: {
    pointsPerKill: number;
    placementPoints: Record<string, number>;
    customStatColumns: Record<string, string>;
  };
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="max-w-lg space-y-5">
      <div>
        <label className="mb-1 block text-xs font-semibold text-zinc-500" htmlFor="pointsPerKill">
          Points per kill
        </label>
        <input
          id="pointsPerKill"
          name="pointsPerKill"
          type="number"
          required
          defaultValue={defaultValues.pointsPerKill}
          className="w-32 rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-zinc-500">Placement points</label>
        <KeyValueRowsInput
          name="placementPointsJson"
          keyLabel="Placement"
          valueLabel="Points"
          keyPlaceholder="1"
          valuePlaceholder="10"
          defaultValue={Object.fromEntries(
            Object.entries(defaultValues.placementPoints).map(([k, v]) => [k, String(v)]),
          )}
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-zinc-500">
          Custom stat columns (optional)
        </label>
        <KeyValueRowsInput
          name="customStatColumnsJson"
          keyLabel="Column key"
          valueLabel="Column label"
          keyPlaceholder="assists"
          valuePlaceholder="Assists"
          defaultValue={defaultValues.customStatColumns}
        />
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.success && <p className="text-sm text-green-600">Saved.</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
      >
        {pending ? "Saving…" : "Save points system"}
      </button>
    </form>
  );
}
