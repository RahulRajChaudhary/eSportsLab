export function formatDateRange(start: Date | null, end: Date | null) {
  if (!start) return "Date TBA";
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  const startStr = start.toLocaleDateString("en-IN", opts);
  if (!end || end.toDateString() === start.toDateString()) {
    return `${startStr}, ${start.getFullYear()}`;
  }
  const sameMonth = end.getMonth() === start.getMonth() && end.getFullYear() === start.getFullYear();
  const endStr = end.toLocaleDateString(
    "en-IN",
    sameMonth ? { day: "numeric" } : opts,
  );
  return `${startStr}–${endStr}, ${end.getFullYear()}`;
}

export function formatINR(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

const COUNTRY_NAMES: Record<string, string> = {
  IN: "🇮🇳 India",
};

export function formatCountry(code: string | null) {
  if (!code) return null;
  return COUNTRY_NAMES[code] ?? code;
}

// Compact Indian numbering (K/L/Cr) for stat tiles — en-IN's "compact"
// notation groups this way natively, unlike the $M/$B grouping formatINR's
// full Intl.NumberFormat would otherwise imply.
export function formatCompactINR(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(amount);
}

export function formatUSD(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}
