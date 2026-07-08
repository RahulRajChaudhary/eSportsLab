import { Skeleton, SkeletonCard } from "@/components/skeleton";

export default function GameTournamentsLoading() {
  return (
    <div className="flex flex-1 flex-col" aria-hidden>
      <section className="border-b border-zinc-100">
        <div className="mx-auto max-w-5xl px-6 pt-12 pb-6">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="mt-3 h-9 w-64" />
        </div>
      </section>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-12">
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} className="h-24" />
          ))}
        </div>
      </main>
    </div>
  );
}
