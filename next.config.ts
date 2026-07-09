import type { NextConfig } from "next";

function safeHostname(url?: string) {
  try {
    return url ? new URL(url).hostname : undefined;
  } catch {
    return undefined;
  }
}

const r2Hostname = safeHostname(process.env.R2_PUBLIC_URL);

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      ...(r2Hostname ? [{ protocol: "https" as const, hostname: r2Hostname }] : []),
      { protocol: "https" as const, hostname: "*.r2.dev" },
    ],
  },
};

export default nextConfig;
