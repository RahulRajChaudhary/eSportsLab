import { Skeleton } from "@/components/skeleton";

export default function RankingsLoading() {
  return (
    <div className="flex flex-1 flex-col" aria-hidden>
      <section className="border-b border-zinc-100">
        <div className="mx-auto max-w-3xl px-6 py-12">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="mt-3 h-9 w-72" />
          <Skeleton className="mt-3 h-4 w-64" />
        </div>
      </section>

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
        <div className="overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-sm">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className={`flex items-center gap-4 px-5 py-4 ${i !== 9 ? "border-b border-zinc-50" : ""}`}
            >
              <Skeleton className="h-7 w-7 rounded-full" />
              <Skeleton className="h-4 w-40" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
