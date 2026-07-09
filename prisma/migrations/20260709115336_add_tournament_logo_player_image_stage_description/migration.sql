-- AlterTable
ALTER TABLE "Player" ADD COLUMN     "imageUrl" TEXT;

-- AlterTable
ALTER TABLE "Stage" ADD COLUMN     "description" TEXT;

-- AlterTable
ALTER TABLE "Tournament" ADD COLUMN     "logoUrl" TEXT,
ADD COLUMN     "showTeamLogos" BOOLEAN NOT NULL DEFAULT false;
