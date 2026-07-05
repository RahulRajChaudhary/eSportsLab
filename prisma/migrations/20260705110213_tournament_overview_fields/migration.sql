-- AlterTable
ALTER TABLE "Stage" ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "startDate" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Tournament" ADD COLUMN     "eventType" TEXT,
ADD COLUMN     "runnerUpTeamId" TEXT;

-- AddForeignKey
ALTER TABLE "Tournament" ADD CONSTRAINT "Tournament_runnerUpTeamId_fkey" FOREIGN KEY ("runnerUpTeamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;
