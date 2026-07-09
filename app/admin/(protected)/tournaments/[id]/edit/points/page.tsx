import { notFound } from "next/navigation";
import { getTournamentForAdmin } from "@/lib/tournament-data";
import { updatePointsSystem } from "@/lib/actions/tournaments";
import { PointsSystemForm } from "@/components/admin/points-system-form";

export default async function TournamentPointsTab({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tournament = await getTournamentForAdmin(id);
  if (!tournament) notFound();

  if (tournament.game.formatType !== "BR") {
    return <p className="text-sm text-zinc-400">Points systems only apply to Battle Royale games.</p>;
  }

  return (
    <PointsSystemForm
      action={updatePointsSystem.bind(null, tournament.id)}
      defaultValues={{
        pointsPerKill: tournament.pointsSystem?.pointsPerKill ?? 1,
        placementPoints: (tournament.pointsSystem?.placementPointsJson as Record<string, number>) ?? {},
        customStatColumns: (tournament.customStatColumnsJson as Record<string, string>) ?? {},
      }}
    />
  );
}
