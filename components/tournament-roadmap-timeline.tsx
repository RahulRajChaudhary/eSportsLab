"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import type { RoadmapTournament } from "@/components/tournament-card";

function formatMonthLabel(start: Date | null, end: Date | null) {
  if (!start) return "TBA";
  const monthShort = (d: Date) =>
    d.toLocaleDateString("en-IN", { month: "short" }).toUpperCase();

  if (!end || (end.getMonth() === start.getMonth() && end.getFullYear() === start.getFullYear())) {
    return `${monthShort(start)} ${start.getFullYear()}`;
  }
  if (end.getFullYear() === start.getFullYear()) {
    return `${monthShort(start)}–${monthShort(end)} ${start.getFullYear()}`;
  }
  return `${monthShort(start)} ${start.getFullYear()} – ${monthShort(end)} ${end.getFullYear()}`;
}

// Decorative zig-zag spine behind the cards — scales with item count instead
// of the fixed-height path a static reference design would use.
function buildWavePath(count: number, segmentHeight: number) {
  let d = "M 200 0";
  for (let i = 0; i < count; i++) {
    const midY = i * segmentHeight + segmentHeight / 2;
    const endY = (i + 1) * segmentHeight;
    const controlX = i % 2 === 0 ? 140 : 260;
    d += ` Q ${controlX} ${midY} 200 ${endY}`;
  }
  return d;
}

const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

function TrophyIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M10 14.66v1.626a2 2 0 0 1-.976 1.696A5 5 0 0 0 7 21.978" />
      <path d="M14 14.66v1.626a2 2 0 0 0 .976 1.696A5 5 0 0 1 17 21.978" />
      <path d="M18 9h1.5a1 1 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z" />
      <path d="M6 9H4.5a1 1 0 0 1 0-5H6" />
    </svg>
  );
}

export function TournamentRoadmapTimeline({
  year,
  tournaments,
}: {
  year: number;
  tournaments: RoadmapTournament[];
}) {
  const segmentHeight = 190;
  const pathHeight = Math.max(tournaments.length, 1) * segmentHeight;
  const wavePath = buildWavePath(tournaments.length, segmentHeight);

  // Tied to scroll progress through this section specifically (0 as it
  // enters the bottom of the viewport, 1 once it's scrolled past the top)
  // so it tracks up/down as the user scrolls, completing by the time
  // they've scrolled past it rather than stretching across the whole page.
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const offsetDistance = useTransform(scrollYProgress, (v) => `${v * 100}%`);

  return (
      <div ref={sectionRef} className="relative overflow-hidden rounded-2xl px-4 py-2">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(37,99,235,0.05)_0%,transparent_50%),radial-gradient(circle_at_70%_70%,rgba(6,182,212,0.04)_0%,transparent_50%)]"
          aria-hidden
        />

        <div className="relative z-10 mb-5 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.6)]" />
            <span className="text-[0.7rem] font-bold tracking-widest text-blue-700 uppercase">
              Tournament Schedule
            </span>
          </div>
          <h2 className="text-xl font-extrabold tracking-tight text-zinc-900 uppercase italic">
            {year} Roadmap
          </h2>
          <Link
            href="/bgmi/rankings"
            className="mt-1 inline-block text-xs font-medium text-blue-700 hover:underline"
          >
            Official ranking leaderboard →
          </Link>
        </div>

        {tournaments.length === 0 ? (
          <p className="relative z-10 text-center text-sm text-zinc-400">
            No tournaments yet.
          </p>
        ) : (
          <div className="relative w-full" style={{ minHeight: pathHeight }}>
            <svg
              className="pointer-events-none absolute top-0 left-1/2 z-0 h-full w-full -translate-x-1/2"
              viewBox={`0 0 400 ${pathHeight}`}
              preserveAspectRatio="xMidYMid meet"
            >
              <path
                d={wavePath}
                stroke="rgba(37, 99, 235, 0.1)"
                strokeWidth={2}
                fill="none"
                strokeLinecap="round"
              />
              <motion.path
                d={wavePath}
                stroke="url(#roadmapGradient)"
                strokeWidth={3}
                fill="none"
                strokeLinecap="round"
                style={{
                  pathLength: scrollYProgress,
                  filter: "drop-shadow(0 0 8px rgba(37,99,235,0.4))",
                }}
              />
              <motion.circle
                r={6}
                fill="#2563eb"
                style={{
                  offsetPath: `path("${wavePath}")`,
                  offsetDistance,
                  filter: "drop-shadow(0 0 10px rgba(37,99,235,0.7))",
                }}
              />
              <defs>
                <linearGradient id="roadmapGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563eb" />
                  <stop offset="50%" stopColor="#1e3a8a" />
                  <stop offset="100%" stopColor="#a5c8f5" />
                </linearGradient>
              </defs>
            </svg>

            <motion.div
              className="relative z-10 flex flex-col gap-10"
              variants={listVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-100px" }}
            >
              {tournaments.map((t) => (
                <motion.div
                  key={t.id}
                  variants={itemVariants}
                  className="rounded-xl border border-blue-100 bg-blue-50/60 p-4 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
                >
                  <div className="mb-2 flex items-center gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">
                      <TrophyIcon />
                    </div>
                    <span className="text-[0.65rem] font-bold tracking-widest text-cyan-600 uppercase">
                      {formatMonthLabel(t.startDate, t.endDate)}
                    </span>
                    {t.status === "ONGOING" && (
                      <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                        LIVE
                      </span>
                    )}
                  </div>
                  <h3 className="mb-1 text-base leading-tight font-extrabold tracking-tight text-blue-900">
                    {t.name}
                  </h3>
                  <p className="text-sm leading-relaxed text-zinc-500">
                    {[t.tier, t.region].filter(Boolean).join(" · ") || "Details TBA"}
                  </p>
                  {t.status === "COMPLETED" && t.winner && (
                    <p className="mt-2 text-xs font-semibold text-amber-700">
                      🏆 {t.winner.name}
                    </p>
                  )}
                </motion.div>
              ))}
            </motion.div>
          </div>
        )}
      </div>
  );
}
