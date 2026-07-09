import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { saveBRMatchEntries } from "@/lib/actions/br-matches";
import { BRMatchEntryForm } from "@/components/admin/br-match-entry-form";

export default async function BRMatchEntryPage({
  params,
}: {
  params: Promise<{ id: string; matchId: string }>;
}) {
  const { id, matchId } = await params;

  const match = await prisma.bRMatch.findUnique({
    where: { id: matchId },
    include: {
      entries: { include: { team: true } },
      tournament: { include: { participants: true } },
    },
  });
  if (!match || match.tournamentId !== id) notFound();

  const allTeams = await prisma.team.findMany({
    where: { gameId: match.tournament.gameId },
    orderBy: { name: "asc" },
    select: { id: true, name: true, logoUrl: true },
  });

  const participantTeamIds = match.tournament.participants.map((p) => p.teamId);

  const existingEntries = match.entries.map((e) => ({
    teamId: e.teamId,
    teamName: e.team.name,
    logoUrl: e.team.logoUrl,
    placement: e.placement,
    kills: e.kills,
    customStats: (e.customStatsJson as Record<string, string> | null) ?? {},
  }));

  const customStatColumns = Object.entries(
    (match.tournament.customStatColumnsJson as Record<string, string> | null) ?? {},
  ).map(([key, label]) => ({ key, label }));

  return (
    <div>
      <Link
        href={`/admin/tournaments/${id}/edit/matches`}
        className="text-xs font-medium text-blue-700 hover:underline"
      >
        ← All matches
      </Link>
      <h1 className="mt-2 text-2xl font-bold tracking-tight text-zinc-900">
        Match {match.matchNumber} · {match.mapName}
      </h1>

      <div className="mt-6">
        <BRMatchEntryForm
          action={saveBRMatchEntries.bind(null, matchId)}
          tournamentId={id}
          existingEntries={existingEntries}
          allTeams={allTeams}
          participantTeamIds={participantTeamIds}
          customStatColumns={customStatColumns}
          showTeamLogos={match.tournament.showTeamLogos}
        />
      </div>
    </div>
  );
}
