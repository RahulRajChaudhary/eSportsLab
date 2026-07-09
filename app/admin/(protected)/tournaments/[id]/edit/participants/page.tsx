import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getTournamentForAdmin } from "@/lib/tournament-data";
import { ParticipantsManager } from "@/components/admin/participants-manager";

export default async function TournamentParticipantsTab({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tournament = await getTournamentForAdmin(id);
  if (!tournament) notFound();

  const participantTeamIds = new Set(tournament.participants.map((p) => p.team.id));
  const eligibleTeams = await prisma.team.findMany({
    where: { gameId: tournament.gameId, id: { notIn: [...participantTeamIds] } },
    orderBy: { name: "asc" },
  });

  return (
    <ParticipantsManager
      tournamentId={tournament.id}
      participants={tournament.participants.map((p) => ({
        id: p.id,
        groupName: p.groupName,
        team: { id: p.team.id, name: p.team.name },
      }))}
      eligibleTeams={eligibleTeams}
    />
  );
}
