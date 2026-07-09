"use client";

import { useState } from "react";

export function StageDescriptionDisclosure({ name, html }: { name: string; html: string }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-semibold text-zinc-700">{name}</h3>
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="text-xs font-medium text-blue-700 hover:underline"
          aria-expanded={expanded}
        >
          {expanded ? "Hide details" : "Show details"}
        </button>
      </div>
      {expanded && (
        <div
          className="prose prose-sm max-w-none rounded-xl border border-zinc-100 bg-zinc-50 p-4"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      )}
    </div>
  );
}
