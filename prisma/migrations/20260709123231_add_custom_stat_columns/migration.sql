-- AlterTable
ALTER TABLE "BRMatchEntry" ADD COLUMN     "customStatsJson" JSONB;

-- AlterTable
ALTER TABLE "Tournament" ADD COLUMN     "customStatColumnsJson" JSONB;
