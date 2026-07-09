import { notFound } from "next/navigation";
import { getTournamentForAdmin } from "@/lib/tournament-data";
import { CsvImportForm } from "@/components/admin/csv-import-form";

export default async function TournamentImportTab({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ stageId?: string }>;
}) {
  const { id } = await params;
  const { stageId } = await searchParams;
  const tournament = await getTournamentForAdmin(id);
  if (!tournament) notFound();

  if (tournament.game.formatType !== "BR") {
    return <p className="text-sm text-zinc-400">CSV import is only available for Battle Royale tournaments.</p>;
  }

  if (tournament.stages.length === 0) {
    return <p className="text-sm text-zinc-400">Add a stage first, in the Stages tab.</p>;
  }

  return (
    <CsvImportForm
      stages={tournament.stages.map((s) => ({ id: s.id, name: s.name }))}
      defaultStageId={stageId}
      participantTeamNames={tournament.participants.map((p) => p.team.name)}
    />
  );
}
