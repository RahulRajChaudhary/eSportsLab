import { PrismaClient } from "@/app/generated/prisma/client";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set — check your .env file");
}

// Reuse the client across hot reloads in dev so we don't exhaust connections.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ accelerateUrl: process.env.DATABASE_URL });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
