"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { slug: "", label: "Details" },
  { slug: "points", label: "Points System" },
  { slug: "stages", label: "Stages" },
  { slug: "participants", label: "Participants" },
  { slug: "matches", label: "Matches" },
] as const;

export function TournamentEditTabNav({ id }: { id: string }) {
  const pathname = usePathname();
  const base = `/admin/tournaments/${id}/edit`;

  return (
    <nav className="mt-4 flex flex-wrap gap-1 border-b border-zinc-100">
      {TABS.map((t) => {
        const href = t.slug ? `${base}/${t.slug}` : base;
        const active = pathname === href;
        return (
          <Link
            key={t.slug || "details"}
            href={href}
            className={`-mb-px rounded-t-lg border-b-2 px-4 py-2 text-sm font-medium ${
              active
                ? "border-blue-600 text-blue-700"
                : "border-transparent text-zinc-500 hover:text-zinc-700"
            }`}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
