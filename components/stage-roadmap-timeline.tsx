"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { formatDateRange } from "@/lib/format";

export type RoadmapStage = {
  id: string;
  name: string;
  startDate: Date | null;
  endDate: Date | null;
  status: "UPCOMING" | "ONGOING" | "COMPLETED" | "TBA";
};

const statusStyles: Record<string, string> = {
  ONGOING: "bg-blue-600 text-white",
  UPCOMING: "bg-blue-50 text-blue-700 border border-blue-200",
  COMPLETED: "bg-zinc-100 text-zinc-500 border border-zinc-200",
};

// Same decorative zig-zag spine as the cross-tournament roadmap, just scaled
// down to sit inside the Overview tab's Format section.
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

function StageMarker({ index, isFinal }: { index: number; isFinal: boolean }) {
  if (isFinal) {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M10 14.66v1.626a2 2 0 0 1-.976 1.696A5 5 0 0 0 7 21.978" />
        <path d="M14 14.66v1.626a2 2 0 0 0 .976 1.696A5 5 0 0 1 17 21.978" />
        <path d="M18 9h1.5a1 1 0 0 0 0-5H18" />
        <path d="M4 22h16" />
        <path d="M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z" />
        <path d="M6 9H4.5a1 1 0 0 1 0-5H6" />
      </svg>
    );
  }
  return <span>{index + 1}</span>;
}

export function StageRoadmapTimeline({
  slug,
  stages,
}: {
  slug: string;
  stages: RoadmapStage[];
}) {
  const segmentHeight = 130;
  const pathHeight = Math.max(stages.length, 1) * segmentHeight;
  const wavePath = buildWavePath(stages.length, segmentHeight);

  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const offsetDistance = useTransform(scrollYProgress, (v) => `${v * 100}%`);

  return (
    <div ref={sectionRef} className="relative overflow-hidden rounded-2xl px-2 py-2">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(37,99,235,0.05)_0%,transparent_50%),radial-gradient(circle_at_70%_70%,rgba(6,182,212,0.04)_0%,transparent_50%)]"
        aria-hidden
      />

      {stages.length === 0 ? (
        <p className="relative z-10 text-sm text-zinc-400">Format not announced yet.</p>
      ) : (
      <div className="relative w-full" style={{ minHeight: pathHeight }}>
        <svg
          className="pointer-events-none absolute top-0 left-1/2 z-0 h-full w-full -translate-x-1/2"
          viewBox={`0 0 400 ${pathHeight}`}
          preserveAspectRatio="xMidYMid meet"
        >
          <path d={wavePath} stroke="rgba(37, 99, 235, 0.1)" strokeWidth={2} fill="none" strokeLinecap="round" />
          <motion.path
            d={wavePath}
            stroke="url(#stageRoadmapGradient)"
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
            <linearGradient id="stageRoadmapGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563eb" />
              <stop offset="50%" stopColor="#1e3a8a" />
              <stop offset="100%" stopColor="#a5c8f5" />
            </linearGradient>
          </defs>
        </svg>

        <motion.div
          className="relative z-10 flex flex-col gap-6"
          variants={listVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
        >
          {stages.map((stage, i) => {
            const isFinal = i === stages.length - 1;
            return (
              <motion.div key={stage.id} variants={itemVariants}>
                <Link
                  href={`/tournament/${slug}?tab=${isFinal ? "finals" : "league"}`}
                  className="block rounded-xl border border-blue-100 bg-blue-50/60 p-4 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
                >
                  <div className="mb-1.5 flex flex-wrap items-center gap-2.5">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white">
                      <StageMarker index={i} isFinal={isFinal} />
                    </div>
                    <h3 className="text-base leading-tight font-extrabold tracking-tight text-blue-900">
                      {stage.name}
                    </h3>
                    {stage.status !== "TBA" && (
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusStyles[stage.status] ?? statusStyles.COMPLETED}`}>
                        {stage.status}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-zinc-500">
                    {formatDateRange(stage.startDate, stage.endDate)}
                  </p>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
      )}
    </div>
  );
}
