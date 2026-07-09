"use client";

import { useRef, useState } from "react";
import { TeamAvatar } from "@/components/team-avatar";
import { uploadAdminImage } from "@/lib/actions/upload";

const MAX_BYTES = 5 * 1024 * 1024;

export function ImageUploadField({
  name,
  label,
  keyPrefix,
  defaultUrl,
  previewName,
}: {
  name: string;
  label: string;
  keyPrefix: string;
  defaultUrl?: string | null;
  previewName: string;
}) {
  const [url, setUrl] = useState(defaultUrl ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError("");
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("Image must be 5MB or smaller.");
      return;
    }

    setUploading(true);
    const fd = new FormData();
    fd.set("file", file);
    fd.set("keyPrefix", keyPrefix);
    const result = await uploadAdminImage(fd);
    setUploading(false);

    if ("error" in result) {
      setError(result.error);
      return;
    }
    setUrl(result.url);
  }

  return (
    <div>
      <label className="mb-1 block text-xs font-semibold text-zinc-500">{label}</label>
      <div className="flex items-center gap-3">
        <TeamAvatar name={previewName || "?"} logoUrl={url || null} size={48} />
        <div>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={(e) => handleFile(e.target.files?.[0])}
            disabled={uploading}
            className="text-xs text-zinc-600 file:mr-3 file:rounded-full file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
          />
          {uploading && <p className="mt-1 text-xs text-zinc-400">Uploading…</p>}
          {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>
      </div>
      <input type="hidden" name={name} value={url} />
    </div>
  );
}
