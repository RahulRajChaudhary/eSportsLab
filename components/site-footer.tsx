import Image from "next/image";

export function SiteFooter() {
  return (
    <footer className="border-t border-zinc-100 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-6 py-8 sm:flex-row sm:justify-between">
        <div className="flex items-center gap-2">
          <Image src="/el-logo.png" alt="" width={28} height={28} />
          <span className="text-sm font-semibold text-zinc-900">
            Esports<span className="text-blue-600">Lab</span>
          </span>
        </div>
        <p className="text-sm text-zinc-400">
          Built for the Indian esports community.
        </p>
      </div>
    </footer>
  );
}
