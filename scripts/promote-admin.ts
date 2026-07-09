// One-off bootstrap: promote a user to ADMIN by email, creating the row if
// they haven't signed in yet. Needed because Auth.js/PrismaAdapter always
// creates new sign-ins as the schema-default USER role — someone has to be
// ADMIN before anyone can be promoted through an admin UI.
//
// Usage: npx tsx scripts/promote-admin.ts <email>
import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set — check your .env file");
}

const prisma = new PrismaClient({ accelerateUrl: process.env.DATABASE_URL });

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Usage: npx tsx scripts/promote-admin.ts <email>");
    process.exit(1);
  }

  const user = await prisma.user.upsert({
    where: { email },
    update: { role: "ADMIN" },
    create: { email, role: "ADMIN" },
  });

  console.log(`${user.email} is now ${user.role} (id: ${user.id})`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
