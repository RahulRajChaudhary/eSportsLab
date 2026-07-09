import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getTournamentForAdmin } from "@/lib/tournament-data";
import { BRMatchStageSection } from "@/components/admin/br-match-stage-section";

export default async function TournamentMatchesTab({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tournament = await getTournamentForAdmin(id);
  if (!tournament) notFound();

  if (tournament.game.formatType !== "BR") {
    return <p className="text-sm text-zinc-400">H2H match entry isn&apos;t available yet.</p>;
  }

  if (tournament.stages.length === 0) {
    return <p className="text-sm text-zinc-400">Add a stage first, in the Stages tab.</p>;
  }

  const stageMatches = await prisma.stage.findMany({
    where: { tournamentId: id },
    orderBy: { order: "asc" },
    include: {
      brMatches: {
        orderBy: { matchNumber: "asc" },
        include: { _count: { select: { entries: true } } },
      },
    },
  });

  return (
    <div className="space-y-6">
      {stageMatches.map((stage) => (
        <BRMatchStageSection
          key={stage.id}
          tournamentId={id}
          stageId={stage.id}
          stageName={stage.name}
          matches={stage.brMatches.map((m) => ({
            id: m.id,
            matchNumber: m.matchNumber,
            mapName: m.mapName,
            entryCount: m._count.entries,
          }))}
          nextMatchNumber={(stage.brMatches.at(-1)?.matchNumber ?? 0) + 1}
        />
      ))}
    </div>
  );
}
