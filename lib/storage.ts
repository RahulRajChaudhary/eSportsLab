import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// Cloudflare R2 via its plain S3-compatible API — not the Workers R2
// binding — keeps this portable across any S3-compatible provider per
// CLAUDE.md's "no Cloudflare-specific proprietary APIs in core logic".
// Module-level singleton, same pattern as lib/prisma.ts.
const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? "",
  },
});

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export async function putImageToR2(file: File, keyPrefix: string): Promise<string> {
  const ext = ALLOWED_TYPES[file.type];
  if (!ext) throw new Error("Unsupported image type — use JPEG, PNG, WebP, or GIF.");
  if (file.size > MAX_BYTES) throw new Error("Image must be 5MB or smaller.");

  const bytes = new Uint8Array(await file.arrayBuffer());
  const key = `${keyPrefix}/${crypto.randomUUID()}.${ext}`;

  await r2.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      Body: bytes,
      ContentType: file.type,
    }),
  );

  return `${process.env.R2_PUBLIC_URL}/${key}`;
}
