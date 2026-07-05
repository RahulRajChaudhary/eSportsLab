import Image from "next/image";

const FALLBACK_COLORS = [
  "bg-blue-600",
  "bg-indigo-600",
  "bg-cyan-600",
  "bg-slate-600",
  "bg-sky-600",
];

function colorForName(name: string) {
  const hash = [...name].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return FALLBACK_COLORS[hash % FALLBACK_COLORS.length];
}

export function TeamAvatar({
  name,
  logoUrl,
  size = 28,
  ring = false,
}: {
  name: string;
  logoUrl?: string | null;
  size?: number;
  ring?: boolean;
}) {
  const dimension = `${size}px`;
  const ringClass = ring ? "ring-2 ring-white" : "";

  if (logoUrl) {
    return (
      <Image
        src={logoUrl}
        alt={name}
        width={size}
        height={size}
        className={`shrink-0 rounded-full object-cover ${ringClass}`}
        style={{ width: dimension, height: dimension }}
      />
    );
  }

  const initials = name
    .split(/\s+/)
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <span
      title={name}
      className={`flex shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white ${colorForName(name)} ${ringClass}`}
      style={{ width: dimension, height: dimension }}
    >
      {initials}
    </span>
  );
}
