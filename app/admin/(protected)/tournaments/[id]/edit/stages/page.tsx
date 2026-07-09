import { notFound } from "next/navigation";
import { getTournamentForAdmin } from "@/lib/tournament-data";
import { StageManager } from "@/components/admin/stage-manager";

export default async function TournamentStagesTab({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tournament = await getTournamentForAdmin(id);
  if (!tournament) notFound();

  return (
    <StageManager
      tournamentId={tournament.id}
      stages={tournament.stages.map((s) => ({
        id: s.id,
        name: s.name,
        order: s.order,
        description: s.description,
        startDate: s.startDate,
        endDate: s.endDate,
        matchCount: tournament.game.formatType === "BR" ? s._count.brMatches : s._count.h2hMatches,
      }))}
    />
  );
}
