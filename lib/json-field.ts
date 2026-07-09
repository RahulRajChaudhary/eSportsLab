import { Prisma } from "@/app/generated/prisma/client";

// Shared by Team/Player `socials` — parses the JSON string produced by
// KeyValueRowsInput. Returns Prisma.JsonNull (not plain `null`) for the
// nullable Json column case, matching what Prisma's generated input types
// actually require for "explicitly clear this JSON column."
export function parseKeyValueJson(json: string): Prisma.InputJsonValue | typeof Prisma.JsonNull {
  try {
    const obj = JSON.parse(json);
    return Object.keys(obj).length > 0 ? obj : Prisma.JsonNull;
  } catch {
    return Prisma.JsonNull;
  }
}
