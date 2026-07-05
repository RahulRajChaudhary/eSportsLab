import Image from "next/image";

// Most footer links point at pages that don't exist yet — they're rendered as
// spans on purpose and get upgraded to <Link> as each page ships.
const columns = [
  {
    heading: "Games",
    items: ["BGMI", "Valorant", "Free Fire", "Mobile Legends", "Chess"],
  },
  {
    heading: "Platform",
    items: ["Tournaments", "Rankings", "News", "Recent Changes", "Graphic Maker"],
  },
  {
    heading: "Community",
    items: ["Contribute", "Discord", "Instagram", "YouTube", "X / Twitter"],
  },
  {
    heading: "Company",
    items: ["About", "Contact", "Content Policy", "Sources & Verification"],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-zinc-100/80 bg-blue-50/20">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-10 md:grid-cols-6">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2">
              <Image src="/el-logo.png" alt="EsportsLab logo" width={36} height={36} />
              <span className="text-base font-bold tracking-tight text-zinc-900">
                Esports<span className="text-blue-600">Lab</span>
              </span>
            </div>
            <p className="mt-3 max-w-xs text-sm leading-6 text-zinc-500">
              India&apos;s esports database — every match verified against its
              source before it goes live.
            </p>
            <p className="mt-4 inline-block rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              Made in India 🇮🇳
            </p>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <div key={col.heading}>
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                {col.heading}
              </h3>
              <ul className="mt-3 space-y-2">
                {col.items.map((item) => (
                  <li key={item}>
                    <span className="cursor-default text-sm text-zinc-600 transition-colors hover:text-blue-600">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center gap-2 border-t border-zinc-100 pt-6 text-xs text-zinc-300 sm:flex-row sm:justify-between">
          <p>{new Date().getFullYear()} EsportsLab. All rights reserved.</p>
          <p>Every stat links to its source.</p>
        </div>
      </div>
    </footer>
  );
}
