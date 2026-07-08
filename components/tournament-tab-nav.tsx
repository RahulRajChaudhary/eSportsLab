"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { slug: "", label: "Overview" },
  { slug: "standings", label: "Standings" },
  { slug: "finals", label: "Grand Finals" },
  { slug: "stats", label: "Stats" },
] as const;

export function TournamentTabNav({ game, slug }: { game: string; slug: string }) {
  const pathname = usePathname();
  const base = `/tournament/${game}/${slug}`;

  return (
    <nav className="mt-6 flex gap-1 border-b border-zinc-100">
      {TABS.map((t) => {
        const href = t.slug ? `${base}/${t.slug}` : base;
        const active = pathname === href;
        return (
          <Link
            key={t.slug || "overview"}
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
