"use server";

import { requireAdmin } from "@/lib/admin-guard";
import { putImageToR2 } from "@/lib/storage";

export type UploadResult = { url: string } | { error: string };

// Called imperatively from a client component (not via useActionState) —
// the caller needs the resulting URL back synchronously to store it in its
// own local form state, not form pending/error semantics.
export async function uploadAdminImage(formData: FormData): Promise<UploadResult> {
  await requireAdmin();

  const file = formData.get("file");
  const keyPrefix = String(formData.get("keyPrefix") ?? "misc");

  if (!(file instanceof File) || file.size === 0) return { error: "No file provided" };

  try {
    return { url: await putImageToR2(file, keyPrefix) };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Upload failed" };
  }
}
