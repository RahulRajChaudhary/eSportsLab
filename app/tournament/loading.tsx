import { Skeleton, SkeletonCard } from "@/components/skeleton";

export default function TournamentIndexLoading() {
  return (
    <div className="flex flex-1 flex-col" aria-hidden>
      <section className="border-b border-zinc-100">
        <div className="mx-auto max-w-6xl px-6 pt-12 pb-8">
          <Skeleton className="h-4 w-40" />
          <div className="mt-4 flex flex-wrap items-start justify-between gap-8">
            <div>
              <Skeleton className="h-9 w-56" />
              <Skeleton className="mt-4 h-4 w-64" />
            </div>
            <Skeleton className="h-20 w-80 rounded-2xl" />
          </div>
          <Skeleton className="mt-8 h-9 w-64 rounded-full" />
        </div>
      </section>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
          <aside className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full rounded-lg" />
            ))}
          </aside>

          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} className="h-24" />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
