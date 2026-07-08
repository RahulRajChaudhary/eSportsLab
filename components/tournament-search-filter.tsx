"use client";

import { useRef, useState } from "react";

// Cards passed in as `children` are already server-rendered (see
// TournamentCard) — this only toggles the `hidden` attribute on the DOM
// nodes that are already there, so the full list still exists in the
// initial HTML for crawlers even before this component hydrates.
export function TournamentSearchFilter({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState<number | null>(null);

  function handleChange(value: string) {
    setQuery(value);
    const container = containerRef.current;
    if (!container) return;

    const needle = value.trim().toLowerCase();
    const cards = container.querySelectorAll<HTMLElement>("[data-tournament-name]");
    let count = 0;
    cards.forEach((card) => {
      const match = !needle || (card.dataset.tournamentName ?? "").includes(needle);
      card.hidden = !match;
      if (match) count++;
    });
    setVisibleCount(needle ? count : null);
  }

  return (
    <div>
      <div className="relative mb-6 max-w-sm">
        <svg
          className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-zinc-400"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="search"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Search tournaments…"
          className="w-full rounded-full border border-zinc-200 bg-white py-2 pr-4 pl-10 text-sm outline-none focus:border-blue-400"
        />
      </div>

      <div ref={containerRef}>{children}</div>

      {visibleCount === 0 && (
        <p className="mt-6 text-sm text-zinc-400">No tournaments match &ldquo;{query}&rdquo;.</p>
      )}
    </div>
  );
}
