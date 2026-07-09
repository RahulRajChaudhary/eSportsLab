"use client";

import { useState } from "react";
import { TeamAvatar } from "@/components/team-avatar";
import { ImageUploadField } from "./image-upload-field";
import { addParticipant } from "@/lib/actions/tournaments";
import { createTeamForMatch } from "@/lib/actions/teams";

type TeamOption = { id: string; name: string; logoUrl: string | null };

const fieldClass =
  "w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-blue-400";

export function TeamCombobox({
  tournamentId,
  allTeams,
  participantTeamIds,
  excludeTeamIds,
  onTeamAdded,
}: {
  tournamentId: string;
  allTeams: TeamOption[];
  participantTeamIds: string[];
  excludeTeamIds: string[];
  onTeamAdded: (team: TeamOption) => void;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const excluded = new Set(excludeTeamIds);
  const participantSet = new Set(participantTeamIds);
  const q = query.trim().toLowerCase();

  const results = q
    ? allTeams.filter((t) => !excluded.has(t.id) && t.name.toLowerCase().includes(q)).slice(0, 20)
    : [];
  const hasExactMatch = results.some((t) => t.name.toLowerCase() === q);

  async function pickExisting(team: TeamOption) {
    setError("");
    if (!participantSet.has(team.id)) {
      setPending(true);
      const fd = new FormData();
      fd.set("tournamentId", tournamentId);
      fd.set("teamId", team.id);
      const result = await addParticipant({}, fd);
      setPending(false);
      if (result.error && result.error !== "That team is already in this tournament.") {
        setError(result.error);
        return;
      }
    }
    onTeamAdded(team);
    setQuery("");
    setOpen(false);
  }

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setPending(true);
    const fd = new FormData(e.currentTarget);
    fd.set("tournamentId", tournamentId);
    const result = await createTeamForMatch(fd);
    setPending(false);
    if ("error" in result) {
      setError(result.error);
      return;
    }
    onTeamAdded(result.team);
    setQuery("");
    setCreating(false);
    setOpen(false);
  }

  return (
    <div
      className="relative rounded-xl border border-dashed border-zinc-200 p-3"
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
          setOpen(false);
          setCreating(false);
        }
      }}
    >
      <label className="mb-1 block text-xs font-semibold text-zinc-500">Add team</label>

      {!creating ? (
        <>
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            placeholder="Type a team name…"
            className={fieldClass}
          />
          {open && q && (
            <div className="absolute z-20 mt-1 max-h-64 w-full max-w-md overflow-y-auto rounded-lg border border-zinc-200 bg-white shadow-lg">
              {results.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  disabled={pending}
                  onClick={() => pickExisting(t)}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-blue-50 disabled:opacity-50"
                >
                  <TeamAvatar name={t.name} logoUrl={t.logoUrl} size={20} />
                  {t.name}
                  {!participantSet.has(t.id) && (
                    <span className="ml-auto text-[10px] font-semibold text-zinc-400">+ add as participant</span>
                  )}
                </button>
              ))}
              {!hasExactMatch && (
                <button
                  type="button"
                  onClick={() => setCreating(true)}
                  className="flex w-full items-center gap-2 border-t border-zinc-100 px-3 py-2 text-left text-sm font-semibold text-blue-700 hover:bg-blue-50"
                >
                  + Create team &ldquo;{query.trim()}&rdquo;
                </button>
              )}
              {results.length === 0 && hasExactMatch === false && q.trim() === "" && (
                <p className="px-3 py-2 text-xs text-zinc-400">Type to search…</p>
              )}
            </div>
          )}
        </>
      ) : (
        <form onSubmit={handleCreate} className="space-y-3">
          <input name="name" defaultValue={query.trim()} required className={fieldClass} placeholder="Team name" />
          <ImageUploadField name="logoUrl" label="Logo (optional)" keyPrefix="teams" previewName={query.trim() || "?"} />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={pending}
              className="rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
            >
              {pending ? "Creating…" : "Create & add"}
            </button>
            <button
              type="button"
              onClick={() => setCreating(false)}
              className="rounded-full border border-zinc-200 px-4 py-2 text-xs font-semibold text-zinc-600 hover:border-blue-300 hover:text-blue-700"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
