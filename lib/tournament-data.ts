import { cache } from "react";
import { prisma } from "@/lib/prisma";

// Wrapped in React's cache() so layout.tsx and each tab's page.tsx can call
// this independently — React dedupes it to a single query per request
// instead of one giant query re-run per route segment.
export const getTournamentBySlug = cache(async (slug: string) => {
  return prisma.tournament.findUnique({
    where: { slug },
    include: {
      game: true,
      winner: true,
      runnerUp: true,
      pointsSystem: true,
      stages: {
        orderBy: { order: "asc" },
        include: {
          brMatches: {
            orderBy: { matchNumber: "asc" },
            include: { entries: { include: { team: true } } },
          },
          h2hMatches: {
            orderBy: { scheduledAt: "asc" },
            include: {
              teamA: true,
              teamB: true,
              mapScores: { orderBy: { order: "asc" } },
            },
          },
        },
      },
      groupStandingsRows: { include: { team: true } },
      awards: { orderBy: { order: "asc" }, include: { player: true, team: true } },
      participants: {
        include: {
          team: {
            include: {
              rosterHistory: {
                where: { leftAt: null },
                orderBy: { joinedAt: "asc" },
                include: { player: true },
              },
            },
          },
        },
      },
    },
  });
});

export type TournamentWithDetails = NonNullable<
  Awaited<ReturnType<typeof getTournamentBySlug>>
>;

// Stages carry their own admin-set dates (independent of individual match
// schedules) so the calendar/format views can show a round's window before
// any matches are entered — derive a status from "today" vs that window.
export function stageStatus(stage: { startDate: Date | null; endDate: Date | null }) {
  if (!stage.startDate || !stage.endDate) return "TBA";
  const now = new Date();
  if (now < stage.startDate) return "UPCOMING";
  if (now > stage.endDate) return "COMPLETED";
  return "ONGOING";
}
