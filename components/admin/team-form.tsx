"use client";

import { useActionState } from "react";
import { KeyValueRowsInput } from "./key-value-rows-input";
import { ImageUploadField } from "./image-upload-field";

type ActionState = { error?: string; success?: boolean };

const fieldClass =
  "w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-blue-400";
const labelClass = "mb-1 block text-xs font-semibold text-zinc-500";

export function TeamForm({
  action,
  games,
  defaultValues,
  submitLabel = "Create team",
}: {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  games: { id: string; name: string }[];
  defaultValues?: {
    name: string;
    slug: string;
    gameId: string;
    region: string | null;
    logoUrl: string | null;
    socials: Record<string, string> | null;
  };
  submitLabel?: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="max-w-lg space-y-5">
      <div>
        <label className={labelClass} htmlFor="name">
          Name
        </label>
        <input id="name" name="name" required defaultValue={defaultValues?.name} className={fieldClass} />
      </div>

      <div>
        <label className={labelClass} htmlFor="slug">
          Slug
        </label>
        <input
          id="slug"
          name="slug"
          defaultValue={defaultValues?.slug}
          placeholder="auto-generated from name if left blank"
          className={fieldClass}
        />
      </div>

      <div>
        <label className={labelClass} htmlFor="gameId">
          Game
        </label>
        <select
          id="gameId"
          name="gameId"
          required
          defaultValue={defaultValues?.gameId ?? ""}
          className={fieldClass}
        >
          <option value="" disabled>
            Select a game
          </option>
          {games.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass} htmlFor="region">
          Region
        </label>
        <input
          id="region"
          name="region"
          defaultValue={defaultValues?.region ?? ""}
          placeholder="India"
          className={fieldClass}
        />
      </div>

      <ImageUploadField
        name="logoUrl"
        label="Logo"
        keyPrefix="teams"
        defaultUrl={defaultValues?.logoUrl}
        previewName={defaultValues?.name ?? "?"}
      />

      <div>
        <label className={labelClass}>Social links</label>
        <KeyValueRowsInput
          name="socialsJson"
          keyLabel="Platform"
          valueLabel="URL"
          keyPlaceholder="twitter"
          valuePlaceholder="https://twitter.com/..."
          defaultValue={defaultValues?.socials}
        />
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.success && <p className="text-sm text-green-600">Saved.</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
      >
        {pending ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
