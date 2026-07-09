"use client";

import { useActionState } from "react";
import { KeyValueRowsInput } from "./key-value-rows-input";
import { ImageUploadField } from "./image-upload-field";

type ActionState = { error?: string; success?: boolean };

const fieldClass =
  "w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-blue-400";
const labelClass = "mb-1 block text-xs font-semibold text-zinc-500";

function toDateInputValue(d: Date | null) {
  return d ? d.toISOString().slice(0, 10) : "";
}

export function TournamentDetailsForm({
  action,
  games,
  mode,
  teams = [],
  defaultValues,
  submitLabel = "Create tournament",
}: {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  games: { id: string; name: string }[];
  mode: "create" | "edit";
  teams?: { id: string; name: string }[];
  defaultValues?: {
    name: string;
    slug: string;
    gameId: string;
    tier: string | null;
    region: string | null;
    eventType: string | null;
    series: string | null;
    season: string | null;
    startDate: Date | null;
    endDate: Date | null;
    prizePool: number | null;
    prizePoolUsd: number | null;
    organizer: string | null;
    sourceLink: string;
    status: string;
    logoUrl: string | null;
    showTeamLogos: boolean;
    winnerTeamId: string | null;
    runnerUpTeamId: string | null;
    prizeBreakdown: { rank: string; amountInr: number }[] | null;
  };
  submitLabel?: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="max-w-2xl space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
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
            placeholder="auto-generated if blank"
            className={fieldClass}
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="gameId">
            Game
          </label>
          <select id="gameId" name="gameId" required defaultValue={defaultValues?.gameId ?? ""} className={fieldClass}>
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
          <label className={labelClass} htmlFor="status">
            Status
          </label>
          <select
            id="status"
            name="status"
            required
            defaultValue={defaultValues?.status ?? "UPCOMING"}
            className={fieldClass}
          >
            <option value="UPCOMING">Upcoming</option>
            <option value="ONGOING">Ongoing</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <label className={labelClass} htmlFor="tier">
            Tier
          </label>
          <input id="tier" name="tier" defaultValue={defaultValues?.tier ?? ""} placeholder="Tier 1" className={fieldClass} />
        </div>
        <div>
          <label className={labelClass} htmlFor="region">
            Region
          </label>
          <input id="region" name="region" defaultValue={defaultValues?.region ?? ""} className={fieldClass} />
        </div>
        <div>
          <label className={labelClass} htmlFor="eventType">
            Type
          </label>
          <input
            id="eventType"
            name="eventType"
            defaultValue={defaultValues?.eventType ?? ""}
            placeholder="Online, LAN..."
            className={fieldClass}
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="series">
            Series
          </label>
          <input id="series" name="series" defaultValue={defaultValues?.series ?? ""} className={fieldClass} />
        </div>
        <div>
          <label className={labelClass} htmlFor="season">
            Season
          </label>
          <input id="season" name="season" defaultValue={defaultValues?.season ?? ""} className={fieldClass} />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="startDate">
            Start date
          </label>
          <input
            id="startDate"
            name="startDate"
            type="date"
            defaultValue={toDateInputValue(defaultValues?.startDate ?? null)}
            className={fieldClass}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="endDate">
            End date
          </label>
          <input
            id="endDate"
            name="endDate"
            type="date"
            defaultValue={toDateInputValue(defaultValues?.endDate ?? null)}
            className={fieldClass}
          />
        </div>
      </div>

      {mode === "edit" && (
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="prizePool">
              Prize pool (INR)
            </label>
            <input
              id="prizePool"
              name="prizePool"
              type="number"
              defaultValue={defaultValues?.prizePool ?? ""}
              className={fieldClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="prizePoolUsd">
              Prize pool (USD)
            </label>
            <input
              id="prizePoolUsd"
              name="prizePoolUsd"
              type="number"
              defaultValue={defaultValues?.prizePoolUsd ?? ""}
              className={fieldClass}
            />
          </div>
        </div>
      )}

      <div>
        <label className={labelClass} htmlFor="organizer">
          Organizer
        </label>
        <input id="organizer" name="organizer" defaultValue={defaultValues?.organizer ?? ""} className={fieldClass} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <ImageUploadField
          name="logoUrl"
          label="Tournament logo (falls back to the game logo if blank)"
          keyPrefix="tournaments"
          defaultUrl={defaultValues?.logoUrl}
          previewName={defaultValues?.name ?? "?"}
        />
        <div className="flex items-end pb-2.5">
          <label className="flex items-center gap-2 text-sm font-medium text-zinc-700">
            <input
              type="checkbox"
              name="showTeamLogos"
              defaultChecked={defaultValues?.showTeamLogos ?? false}
              className="h-4 w-4 rounded border-zinc-300"
            />
            Show team logos (standings, winner/runner-up, rosters)
          </label>
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="sourceLink">
          Source link (required)
        </label>
        <input
          id="sourceLink"
          name="sourceLink"
          required
          defaultValue={defaultValues?.sourceLink}
          placeholder="https://..."
          className={fieldClass}
        />
      </div>

      {mode === "edit" && (
        <>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className={labelClass} htmlFor="winnerTeamId">
                Winner
              </label>
              <select id="winnerTeamId" name="winnerTeamId" defaultValue={defaultValues?.winnerTeamId ?? ""} className={fieldClass}>
                <option value="">TBA</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass} htmlFor="runnerUpTeamId">
                Runner-up
              </label>
              <select id="runnerUpTeamId" name="runnerUpTeamId" defaultValue={defaultValues?.runnerUpTeamId ?? ""} className={fieldClass}>
                <option value="">TBA</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>Prize breakdown</label>
            <KeyValueRowsInput
              name="prizeBreakdownJson"
              keyLabel="Placement"
              valueLabel="Amount (INR)"
              keyPlaceholder="1st"
              valuePlaceholder="2000000"
              defaultValue={
                defaultValues?.prizeBreakdown
                  ? Object.fromEntries(defaultValues.prizeBreakdown.map((r) => [r.rank, String(r.amountInr)]))
                  : undefined
              }
            />
          </div>
        </>
      )}

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
