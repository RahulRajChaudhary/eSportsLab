import { Skeleton, SkeletonCard } from "@/components/skeleton";

export default function PlayerLoading() {
  return (
    <div className="flex flex-1 flex-col" aria-hidden>
      <section className="border-b border-zinc-100">
        <div className="mx-auto max-w-5xl px-6 pt-12 pb-6">
          <Skeleton className="h-4 w-24" />
          <div className="mt-4 flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div>
              <Skeleton className="h-8 w-48" />
              <Skeleton className="mt-2 h-4 w-32" />
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-12">
        <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
          <div className="space-y-10">
            <div>
              <Skeleton className="mb-4 h-4 w-28" />
              <SkeletonCard className="h-16" />
            </div>
            <div>
              <Skeleton className="mb-4 h-4 w-28" />
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <SkeletonCard key={i} className="h-12" />
                ))}
              </div>
            </div>
          </div>

          <Skeleton className="h-40 w-full rounded-2xl" />
        </div>
      </main>
    </div>
  );
}
