import { Skeleton } from "@/components/skeleton";

export default function TournamentTabLoading() {
  return (
    <div className="space-y-4" aria-hidden>
      <Skeleton className="h-40 w-full rounded-2xl" />
      <Skeleton className="h-40 w-full rounded-2xl" />
      <Skeleton className="h-40 w-full rounded-2xl" />
    </div>
  );
}
