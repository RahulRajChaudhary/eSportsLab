import Link from "next/link";
import { formatDateRange, formatINR } from "@/lib/format";
import { TeamAvatar } from "@/components/team-avatar";

const ACCENT_BAR: Record<string, string> = {
  ONGOING: "bg-blue-600",
  UPCOMING: "bg-cyan-500",
  COMPLETED: "bg-zinc-200",
};

const statusStyles: Record<string, string> = {
  ONGOING: "bg-blue-600 text-white",
  UPCOMING: "bg-blue-50 text-blue-700 border border-blue-200",
  COMPLETED: "bg-zinc-100 text-zinc-500 border border-zinc-200",
};

export type TournamentCardData = {
  slug: string;
  name: string;
  tier: string | null;
  region: string | null;
  status: "UPCOMING" | "ONGOING" | "COMPLETED";
  startDate: Date | null;
  endDate: Date | null;
  prizePool: number | null;
  logoUrl: string | null;
  game: { slug: string; name: string; logoUrl: string | null };
  participantCount: number;
};

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3.5 w-3.5" aria-hidden>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}

function TeamsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3.5 w-3.5" aria-hidden>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3.5 w-3.5" aria-hidden>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

// Purely decorative — computed off a timestamp passed down from the page
// (fine at revalidate: 60) rather than client JS, so it's present in the
// crawled HTML too. `now` is threaded in as a prop instead of calling
// Date.now() here since components must stay pure during render.
function ProgressBar({ tournament, now }: { tournament: TournamentCardData; now: number }) {
  if (tournament.status === "ONGOING" && tournament.startDate && tournament.endDate) {
    const start = tournament.startDate.getTime();
    const end = tournament.endDate.getTime();
    const pct = Math.min(100, Math.max(0, ((now - start) / (end - start)) * 100));
    return (
      <div className="mt-4 flex items-center gap-3">
        <span className="text-[10px] font-bold tracking-wide text-zinc-400 uppercase">Progress</span>
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-100">
          <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400" style={{ width: `${pct}%` }} />
        </div>
        <span className="text-xs font-semibold text-zinc-500">{Math.round(pct)}%</span>
      </div>
    );
  }

  if (tournament.status === "UPCOMING" && tournament.startDate) {
    const msUntil = tournament.startDate.getTime() - now;
    const days = Math.max(0, Math.floor(msUntil / 86_400_000));
    const hours = Math.max(0, Math.floor((msUntil % 86_400_000) / 3_600_000));
    // Decorative proximity fill only — not a literal countdown fraction.
    const pct = Math.min(100, Math.max(6, 100 - (days / 90) * 100));
    return (
      <div className="mt-4 flex items-center gap-3">
        <span className="text-[10px] font-bold tracking-wide text-zinc-400 uppercase">Starts in</span>
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-100">
          <div className="h-full rounded-full bg-cyan-400" style={{ width: `${pct}%` }} />
        </div>
        <span className="text-xs font-semibold text-zinc-500">
          {days}d {hours}h
        </span>
      </div>
    );
  }

  return null;
}

// Rendered server-side and left in the initial HTML even when the client
// search filter hides it (see TournamentSearchFilter) — unlike the CSR
// tournament cards on the esportsverse.in reference, crawlers always see
// the full card content.
export function TournamentCard({ tournament, now }: { tournament: TournamentCardData; now: number }) {
  return (
    <Link
      href={`/tournament/${tournament.game.slug}/${tournament.slug}`}
      data-tournament-name={tournament.name.toLowerCase()}
      className="group relative block overflow-hidden rounded-2xl border border-zinc-100 bg-white pl-4 shadow-sm transition-shadow hover:shadow-md"
    >
      <span className={`absolute top-0 left-0 h-full w-1 ${ACCENT_BAR[tournament.status]}`} aria-hidden />

      <div className="flex flex-wrap items-center gap-4 py-4 pr-4">
        <TeamAvatar name={tournament.game.name} logoUrl={tournament.logoUrl ?? tournament.game.logoUrl} size={40} />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-zinc-900 group-hover:text-blue-700">{tournament.name}</h3>
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide ${statusStyles[tournament.status]}`}
            >
              {tournament.status}
            </span>
            {tournament.tier && (
              <span className="shrink-0 rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[10px] font-semibold text-zinc-500">
                {tournament.tier}
              </span>
            )}
          </div>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-500">
            <span className="flex items-center gap-1">
              <CalendarIcon />
              {formatDateRange(tournament.startDate, tournament.endDate)}
            </span>
            {tournament.participantCount > 0 && (
              <span className="flex items-center gap-1">
                <TeamsIcon />
                {tournament.participantCount} Teams
              </span>
            )}
            {tournament.region && (
              <span className="flex items-center gap-1">
                <PinIcon />
                {tournament.region}
              </span>
            )}
          </div>

          <ProgressBar tournament={tournament} now={now} />
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-3 text-right">
          {tournament.prizePool ? (
            <div>
              <p className="text-[10px] font-bold tracking-wide text-zinc-400 uppercase">Prize Pool</p>
              <p className="font-bold text-blue-700">{formatINR(tournament.prizePool)}</p>
            </div>
          ) : (
            <p className="text-xs text-zinc-300">TBA</p>
          )}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4 text-zinc-300 group-hover:text-blue-500" aria-hidden>
            <path d="m9 18 6-6-6-6" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
