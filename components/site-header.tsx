import Image from "next/image";
import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-zinc-100 bg-white backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/el-logo.png"
            alt="EsportsLab logo"
            width={40}
            height={40}
            priority
          />
          <span className="text-lg font-bold tracking-tight text-zinc-900">
            Esports<span className="text-blue-600">Lab</span>
          </span>
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium text-zinc-600">
          <Link href="/tournament" className="transition-colors hover:text-blue-600">
            Tournaments
          </Link>
          <Link href="/bgmi" className="transition-colors hover:text-blue-600">
            Rankings
          </Link>
          <Link href="/#news" className="transition-colors hover:text-blue-600">
            News
          </Link>
        </nav>
      </div>
    </header>
  );
}
