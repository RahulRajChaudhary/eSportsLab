"use client";

import { useEffect, useState } from "react";

const STEPS = [
  {
    step: "1",
    title: "Find the Pencil",
    body: "Click the edit icon on stats, rosters, or prize pools.",
  },
  {
    step: "2",
    title: "Submit Changes",
    body: "Provide accurate, updated data and optional proof.",
  },
  {
    step: "3",
    title: "Get Approved",
    body: "Our moderators will review and merge your update to the live site!",
  },
];

export function ContributeModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full border border-zinc-200 bg-white px-6 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:border-blue-300 hover:text-blue-700"
      >
        How to contribute
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="contribute-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 px-4 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-3xl border border-zinc-100 bg-white p-8 shadow-[0_24px_60px_-20px_rgba(37,99,235,0.35)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <h2 id="contribute-modal-title" className="text-2xl font-bold tracking-tight text-zinc-900">
                Contribute to EsportsLab
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="shrink-0 rounded-full p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="mt-3 text-sm leading-6 text-zinc-500">
              EsportsLab is driven by the community! While browsing the platform, keep an
              eye out for the edit icon on tournament and organization pages.
            </p>

            <ol className="mt-6 space-y-4">
              {STEPS.map((item) => (
                <li key={item.step} className="flex gap-4">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                    {item.step}
                  </span>
                  <div>
                    <p className="font-semibold text-zinc-900">{item.title}</p>
                    <p className="mt-0.5 text-sm text-zinc-500">{item.body}</p>
                  </div>
                </li>
              ))}
            </ol>

            <p className="mt-6 border-t border-zinc-100 pt-5 text-sm font-medium text-blue-700">
              Help us build the most accurate esports database in the world!
            </p>
          </div>
        </div>
      )}
    </>
  );
}
