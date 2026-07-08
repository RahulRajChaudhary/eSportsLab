import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTournamentBySlug } from "@/lib/tournament-data";
import { SITE_URL, buildBreadcrumbJsonLd, jsonLdGraph } from "@/lib/seo";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ game: string; slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tournament = await getTournamentBySlug(slug);
  if (!tournament) return {};

  const title = `${tournament.name} Stats | EsportsLab`;
  const url = `${SITE_URL}/tournament/${tournament.game.slug}/${tournament.slug}/stats`;

  return {
    title,
    description: `Player and team statistics for ${tournament.name}.`,
    alternates: { canonical: url },
    openGraph: { title, url, type: "website" },
  };
}

export default async function TournamentStats({
  params,
}: {
  params: Promise<{ game: string; slug: string }>;
}) {
  const { game: gameSlug, slug } = await params;
  const tournament = await getTournamentBySlug(slug);
  if (!tournament || tournament.game.slug !== gameSlug) notFound();

  const url = `${SITE_URL}/tournament/${tournament.game.slug}/${tournament.slug}/stats`;
  const jsonLd = jsonLdGraph(
    buildBreadcrumbJsonLd([
      { name: "Home", url: SITE_URL },
      { name: "Tournaments", url: `${SITE_URL}/tournament` },
      { name: tournament.game.name, url: `${SITE_URL}/tournament/${tournament.game.slug}` },
      { name: tournament.name, url: `${SITE_URL}/tournament/${tournament.game.slug}/${tournament.slug}` },
      { name: "Stats", url },
    ]),
  );

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <h1 className="sr-only">{tournament.name} Stats</h1>
      <p className="text-sm text-zinc-400">
        Tournament statistics are coming in a later release.
      </p>
    </div>
  );
}
