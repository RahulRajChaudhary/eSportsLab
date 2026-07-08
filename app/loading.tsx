import { Skeleton, SkeletonCard } from "@/components/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-1 flex-col" aria-hidden>
      <section className="mx-auto w-full max-w-3xl px-6 pt-10 pb-4 text-center">
        <Skeleton className="mx-auto h-6 w-56 rounded-full" />
        <Skeleton className="mx-auto mt-4 h-10 w-full max-w-xl" />
        <Skeleton className="mx-auto mt-3 h-4 w-2/3" />
        <Skeleton className="mx-auto mt-6 h-12 w-full max-w-xl rounded-full" />
      </section>

      <section className="mx-auto flex w-full max-w-6xl gap-4 overflow-hidden px-6 py-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-40 shrink-0 rounded-2xl" />
        ))}
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-8">
        <Skeleton className="h-56 w-full rounded-3xl" />
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 pb-10">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-6">
        <div className="grid gap-5 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} className="h-32" />
          ))}
        </div>
      </section>
    </div>
  );
}
