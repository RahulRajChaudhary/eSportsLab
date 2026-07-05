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
