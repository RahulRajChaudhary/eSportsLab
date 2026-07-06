-- AlterTable
ALTER TABLE "Tournament" ADD COLUMN     "prizeBreakdownJson" JSONB,
ADD COLUMN     "prizePoolUsd" INTEGER,
ADD COLUMN     "season" TEXT,
ADD COLUMN     "series" TEXT;

-- CreateTable
CREATE TABLE "TournamentAward" (
    "id" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "playerId" TEXT,
    "teamId" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "TournamentAward_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TournamentAward" ADD CONSTRAINT "TournamentAward_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentAward" ADD CONSTRAINT "TournamentAward_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentAward" ADD CONSTRAINT "TournamentAward_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;
