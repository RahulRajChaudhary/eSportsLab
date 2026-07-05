import { TeamAvatar } from "@/components/team-avatar";

export type RoadmapTournament = {
  id: string;
  name: string;
  tier: string | null;
  region: string | null;
  status: "UPCOMING" | "ONGOING" | "COMPLETED";
  startDate: Date | null;
  endDate: Date | null;
  participants: { team: { id: string; name: string; logoUrl: string | null } }[];
  winner: { id: string; name: string; logoUrl: string | null } | null;
};

const statusStyles: Record<string, string> = {
  ONGOING: "bg-blue-600 text-white",
  UPCOMING: "bg-blue-50 text-blue-700 border border-blue-200",
  COMPLETED: "bg-zinc-100 text-zinc-500 border border-zinc-200",
};

function formatDateRange(start: Date | null, end: Date | null) {
  if (!start) return "Date TBA";
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  const startStr = start.toLocaleDateString("en-IN", opts);
  if (!end || end.toDateString() === start.toDateString()) {
    return `${startStr}, ${start.getFullYear()}`;
  }
  const sameMonth = end.getMonth() === start.getMonth() && end.getFullYear() === start.getFullYear();
  const endStr = end.toLocaleDateString(
    "en-IN",
    sameMonth ? { day: "numeric" } : opts,
  );
  return `${startStr}–${endStr}, ${end.getFullYear()}`;
}

// Compact row for the sidebar roadmap marquee — narrow by design, not a
// horizontal-scroll card, so it stays legible at ~300-360px column width.
export function TournamentCard({ tournament }: { tournament: RoadmapTournament }) {
  return (
    <div className="w-full shrink-0 rounded-xl border border-zinc-100 bg-white p-3 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-sm font-semibold text-zinc-900">
          {tournament.name}
        </span>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusStyles[tournament.status]}`}
        >
          {tournament.status}
        </span>
      </div>
      <p className="mt-0.5 text-xs text-zinc-400">
        {formatDateRange(tournament.startDate, tournament.endDate)}
        {tournament.tier ? ` · ${tournament.tier}` : ""}
      </p>

      <div className="mt-2 flex items-center justify-between gap-2">
        {tournament.participants.length > 0 && (
          <div className="flex -space-x-1.5">
            {tournament.participants.slice(0, 4).map(({ team }) => (
              <TeamAvatar key={team.id} name={team.name} logoUrl={team.logoUrl} size={20} ring />
            ))}
          </div>
        )}
        {tournament.status === "COMPLETED" && tournament.winner && (
          <span className="flex min-w-0 items-center gap-1 text-xs font-medium text-amber-700">
            <span aria-hidden>🏆</span>
            <span className="truncate">{tournament.winner.name}</span>
          </span>
        )}
      </div>
    </div>
  );
}
