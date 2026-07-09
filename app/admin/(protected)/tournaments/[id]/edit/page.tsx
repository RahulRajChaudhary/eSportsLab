import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getTournamentForAdmin } from "@/lib/tournament-data";
import { updateTournamentDetails } from "@/lib/actions/tournaments";
import { TournamentDetailsForm } from "@/components/admin/tournament-details-form";

export default async function TournamentDetailsTab({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tournament = await getTournamentForAdmin(id);
  if (!tournament) notFound();

  const [games, teams] = await Promise.all([
    prisma.game.findMany({ orderBy: { name: "asc" } }),
    prisma.team.findMany({ where: { gameId: tournament.gameId }, orderBy: { name: "asc" } }),
  ]);

  return (
    <TournamentDetailsForm
      action={updateTournamentDetails.bind(null, tournament.id)}
      games={games}
      teams={teams}
      mode="edit"
      submitLabel="Save changes"
      defaultValues={{
        name: tournament.name,
        slug: tournament.slug,
        gameId: tournament.gameId,
        tier: tournament.tier,
        region: tournament.region,
        eventType: tournament.eventType,
        series: tournament.series,
        season: tournament.season,
        startDate: tournament.startDate,
        endDate: tournament.endDate,
        prizePool: tournament.prizePool,
        prizePoolUsd: tournament.prizePoolUsd,
        organizer: tournament.organizer,
        sourceLink: tournament.sourceLink,
        status: tournament.status,
        logoUrl: tournament.logoUrl,
        showTeamLogos: tournament.showTeamLogos,
        winnerTeamId: tournament.winnerTeamId,
        runnerUpTeamId: tournament.runnerUpTeamId,
        prizeBreakdown: tournament.prizeBreakdownJson as { rank: string; amountInr: number }[] | null,
      }}
    />
  );
}
