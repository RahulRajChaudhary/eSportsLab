-- CreateEnum
CREATE TYPE "FormatType" AS ENUM ('BR', 'H2H');

-- CreateEnum
CREATE TYPE "TournamentStatus" AS ENUM ('UPCOMING', 'ONGOING', 'COMPLETED');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'EDITOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "RevisionEntityType" AS ENUM ('TOURNAMENT', 'TEAM', 'PLAYER', 'BR_MATCH', 'H2H_MATCH', 'NEWS_POST');

-- CreateEnum
CREATE TYPE "RevisionStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "Game" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logoUrl" TEXT,
    "formatType" "FormatType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tournament" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "tier" TEXT,
    "region" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "prizePool" INTEGER,
    "organizer" TEXT,
    "sourceLink" TEXT NOT NULL,
    "status" "TournamentStatus" NOT NULL DEFAULT 'UPCOMING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tournament_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TournamentTeam" (
    "id" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "groupName" TEXT,

    CONSTRAINT "TournamentTeam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Stage" (
    "id" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Stage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PointsSystem" (
    "id" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "placementPointsJson" JSONB NOT NULL,
    "pointsPerKill" INTEGER NOT NULL,
    "bonusRulesJson" JSONB,

    CONSTRAINT "PointsSystem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BRMatch" (
    "id" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "stageId" TEXT NOT NULL,
    "matchNumber" INTEGER NOT NULL,
    "scheduledAt" TIMESTAMP(3),

    CONSTRAINT "BRMatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BRMatchEntry" (
    "id" TEXT NOT NULL,
    "brMatchId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "placement" INTEGER NOT NULL,
    "kills" INTEGER NOT NULL,
    "pointsEarned" INTEGER NOT NULL,

    CONSTRAINT "BRMatchEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BRStandingsColumn" (
    "id" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "showMatchesPlayed" BOOLEAN NOT NULL DEFAULT true,
    "showWwcd" BOOLEAN NOT NULL DEFAULT true,
    "showBonus" BOOLEAN NOT NULL DEFAULT false,
    "showPlacementPts" BOOLEAN NOT NULL DEFAULT true,
    "showKillPts" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "BRStandingsColumn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "H2HMatch" (
    "id" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "stageId" TEXT NOT NULL,
    "teamAId" TEXT NOT NULL,
    "teamBId" TEXT NOT NULL,
    "bestOf" INTEGER NOT NULL,
    "scheduledAt" TIMESTAMP(3),

    CONSTRAINT "H2HMatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MapScore" (
    "id" TEXT NOT NULL,
    "h2hMatchId" TEXT NOT NULL,
    "mapName" TEXT NOT NULL,
    "scoreA" INTEGER NOT NULL,
    "scoreB" INTEGER NOT NULL,
    "winnerTeamId" TEXT,
    "order" INTEGER NOT NULL,

    CONSTRAINT "MapScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupStandingsRow" (
    "id" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "groupName" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "wins" INTEGER NOT NULL DEFAULT 0,
    "losses" INTEGER NOT NULL DEFAULT 0,
    "mapDiff" INTEGER NOT NULL DEFAULT 0,
    "points" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "GroupStandingsRow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Team" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "logoUrl" TEXT,
    "region" TEXT,
    "socials" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Player" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "realName" TEXT,
    "gameId" TEXT NOT NULL,
    "country" TEXT,
    "socials" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RosterHistory" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "role" TEXT,
    "joinedAt" TIMESTAMP(3) NOT NULL,
    "leftAt" TIMESTAMP(3),

    CONSTRAINT "RosterHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RankingSnapshot" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "teamId" TEXT,
    "playerId" TEXT,
    "points" INTEGER NOT NULL,
    "rank" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RankingSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewsPost" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NewsPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Revision" (
    "id" TEXT NOT NULL,
    "entityType" "RevisionEntityType" NOT NULL,
    "entityId" TEXT,
    "diffJson" JSONB NOT NULL,
    "sourceLink" TEXT NOT NULL,
    "editorId" TEXT NOT NULL,
    "status" "RevisionStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),

    CONSTRAINT "Revision_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Game_slug_key" ON "Game"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Tournament_slug_key" ON "Tournament"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "TournamentTeam_tournamentId_teamId_key" ON "TournamentTeam"("tournamentId", "teamId");

-- CreateIndex
CREATE UNIQUE INDEX "PointsSystem_tournamentId_key" ON "PointsSystem"("tournamentId");

-- CreateIndex
CREATE UNIQUE INDEX "BRMatchEntry_brMatchId_teamId_key" ON "BRMatchEntry"("brMatchId", "teamId");

-- CreateIndex
CREATE UNIQUE INDEX "BRStandingsColumn_tournamentId_key" ON "BRStandingsColumn"("tournamentId");

-- CreateIndex
CREATE UNIQUE INDEX "GroupStandingsRow_tournamentId_groupName_teamId_key" ON "GroupStandingsRow"("tournamentId", "groupName", "teamId");

-- CreateIndex
CREATE UNIQUE INDEX "Team_slug_key" ON "Team"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Player_slug_key" ON "Player"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "NewsPost_slug_key" ON "NewsPost"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Tournament" ADD CONSTRAINT "Tournament_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentTeam" ADD CONSTRAINT "TournamentTeam_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentTeam" ADD CONSTRAINT "TournamentTeam_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stage" ADD CONSTRAINT "Stage_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PointsSystem" ADD CONSTRAINT "PointsSystem_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BRMatch" ADD CONSTRAINT "BRMatch_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BRMatch" ADD CONSTRAINT "BRMatch_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "Stage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BRMatchEntry" ADD CONSTRAINT "BRMatchEntry_brMatchId_fkey" FOREIGN KEY ("brMatchId") REFERENCES "BRMatch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BRMatchEntry" ADD CONSTRAINT "BRMatchEntry_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BRStandingsColumn" ADD CONSTRAINT "BRStandingsColumn_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "H2HMatch" ADD CONSTRAINT "H2HMatch_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "H2HMatch" ADD CONSTRAINT "H2HMatch_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "Stage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "H2HMatch" ADD CONSTRAINT "H2HMatch_teamAId_fkey" FOREIGN KEY ("teamAId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "H2HMatch" ADD CONSTRAINT "H2HMatch_teamBId_fkey" FOREIGN KEY ("teamBId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MapScore" ADD CONSTRAINT "MapScore_h2hMatchId_fkey" FOREIGN KEY ("h2hMatchId") REFERENCES "H2HMatch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupStandingsRow" ADD CONSTRAINT "GroupStandingsRow_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupStandingsRow" ADD CONSTRAINT "GroupStandingsRow_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RosterHistory" ADD CONSTRAINT "RosterHistory_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RosterHistory" ADD CONSTRAINT "RosterHistory_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RankingSnapshot" ADD CONSTRAINT "RankingSnapshot_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RankingSnapshot" ADD CONSTRAINT "RankingSnapshot_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RankingSnapshot" ADD CONSTRAINT "RankingSnapshot_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NewsPost" ADD CONSTRAINT "NewsPost_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Revision" ADD CONSTRAINT "Revision_editorId_fkey" FOREIGN KEY ("editorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
