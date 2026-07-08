export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-zinc-100 ${className}`} />;
}

export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-2xl border border-zinc-100 bg-white p-5 shadow-sm ${className}`}
    >
      <div className="h-4 w-2/3 rounded-md bg-zinc-100" />
      <div className="mt-3 h-3 w-1/2 rounded-md bg-zinc-100" />
    </div>
  );
}
