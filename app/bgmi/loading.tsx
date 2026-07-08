import { Skeleton, SkeletonCard } from "@/components/skeleton";

export default function BgmiLoading() {
  return (
    <div className="flex flex-1 flex-col" aria-hidden>
      <section className="border-b border-zinc-100">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <Skeleton className="h-5 w-56 rounded-full" />
          <Skeleton className="mt-3 h-9 w-32" />
          <Skeleton className="mt-3 h-4 w-full max-w-xl" />
        </div>
      </section>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">
        <div className="flex flex-col gap-12 lg:flex-row">
          <div className="min-w-0 flex-1 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} className="h-20" />
            ))}
            <Skeleton className="mt-8 h-64 w-full rounded-2xl" />
          </div>

          <div className="mt-12 w-full shrink-0 space-y-3 lg:mt-0 lg:w-[420px]">
            <Skeleton className="h-40 w-full rounded-2xl" />
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonCard key={i} className="h-16" />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
