// Domain isn't provisioned yet (see docs/launch-plan.md M4) — falls back to a
// placeholder so JSON-LD/canonical URLs are well-formed in dev either way.
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://esportslab.site";

export type BreadcrumbItem = { name: string; url: string };

export function buildBreadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export type ItemListEntry = { name: string; url: string };

export function buildItemListJsonLd(name: string, url: string, items: ItemListEntry[]) {
  return {
    "@type": "ItemList",
    name,
    url,
    numberOfItems: items.length,
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      url: item.url,
    })),
  };
}

const EVENT_STATUS: Record<string, string> = {
  UPCOMING: "https://schema.org/EventScheduled",
  ONGOING: "https://schema.org/EventScheduled",
  COMPLETED: "https://schema.org/EventScheduled",
};

export function buildSportsEventJsonLd(tournament: {
  name: string;
  url: string;
  startDate: Date | null;
  endDate: Date | null;
  region: string | null;
  organizer: string | null;
  status: string;
  imageUrl: string | null;
}) {
  return {
    "@type": "SportsEvent",
    name: tournament.name,
    url: tournament.url,
    ...(tournament.startDate && { startDate: tournament.startDate.toISOString() }),
    ...(tournament.endDate && { endDate: tournament.endDate.toISOString() }),
    ...(tournament.region && {
      location: { "@type": "Place", name: tournament.region },
    }),
    ...(tournament.organizer && {
      organizer: { "@type": "Organization", name: tournament.organizer },
    }),
    eventStatus: EVENT_STATUS[tournament.status] ?? EVENT_STATUS.UPCOMING,
    eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
    ...(tournament.imageUrl && { image: tournament.imageUrl }),
  };
}

export function jsonLdGraph(...nodes: object[]) {
  return JSON.stringify({ "@context": "https://schema.org", "@graph": nodes });
}
