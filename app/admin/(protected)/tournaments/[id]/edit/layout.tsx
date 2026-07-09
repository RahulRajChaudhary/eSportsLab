import { notFound } from "next/navigation";
import Link from "next/link";
import { getTournamentForAdmin } from "@/lib/tournament-data";
import { TournamentEditTabNav } from "@/components/admin/tournament-edit-tab-nav";

export default async function TournamentEditLayout({
  params,
  children,
}: {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
}) {
  const { id } = await params;
  const tournament = await getTournamentForAdmin(id);
  if (!tournament) notFound();

  return (
    <div>
      <Link href="/admin/tournaments" className="text-xs font-medium text-blue-700 hover:underline">
        ← All tournaments
      </Link>
      <h1 className="mt-2 text-2xl font-bold tracking-tight text-zinc-900">{tournament.name}</h1>
      <p className="mt-1 text-sm text-zinc-500">
        {tournament.game.name} · {tournament.status}
      </p>
      <TournamentEditTabNav id={id} />
      <div className="mt-6">{children}</div>
    </div>
  );
}
