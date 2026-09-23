"use client";

import { useState } from "react";
import { FiEdit2 } from "react-icons/fi";
import type { StoryboardStep } from "./storyboard-data";

export function PlanVisualizer({
  activeStep,
  onSelectStep,
  steps,
}: {
  activeStep: number;
  onSelectStep: (step: number) => void;
  steps: StoryboardStep[];
}) {
  const [levelsOpen, setLevelsOpen] = useState(false);

  return (
    <section aria-labelledby="plan-visualizer-title" className="min-w-0 lg:pr-8">
      <header className="flex items-center justify-between gap-4 border-b border-white/20 pb-5">
        <div className="flex min-w-0 items-center gap-4">
          <span aria-hidden="true" className="grid size-5 shrink-0 place-items-center border border-white/70">
            <span className="size-2 bg-white" />
          </span>
          <div className="min-w-0">
            <p className="text-[0.6rem] uppercase tracking-[0.2em] text-white/40">
              {levelsOpen ? "Progression" : "Plan visualizer"}
            </p>
            <h2 className="mt-1 truncate text-sm font-semibold text-white" id="plan-visualizer-title">
              {levelsOpen ? "Levels" : "Complete current route"}
            </h2>
          </div>
        </div>
        <button
          aria-controls="planning-pane-content"
          aria-pressed={levelsOpen}
          className={`shrink-0 cursor-pointer rounded-full border px-3 py-1 text-[0.55rem] font-semibold uppercase tracking-[0.14em] transition-colors focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white ${
            levelsOpen
              ? "border-white bg-white text-black"
              : "border-white/40 bg-transparent text-white/65 hover:border-white hover:text-white"
          }`}
          onClick={() => setLevelsOpen((open) => !open)}
          type="button"
        >
          Levels
        </button>
      </header>

      <div id="planning-pane-content">
        {levelsOpen ? (
          <ol className="mt-6 grid gap-4">
            <li className="border border-white/45 p-5">
              <div className="flex items-center justify-between gap-5">
                <div>
                  <p className="font-mono text-[0.55rem] uppercase tracking-[0.18em] text-white/40">Level I</p>
                  <h3 className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-white">Essentials</h3>
                </div>
                <span className="text-[0.55rem] uppercase tracking-[0.14em] text-white/45">0 / 4</span>
              </div>
              <div aria-hidden="true" className="mt-5 h-1 border border-white/35 p-px">
                <span className="block h-full w-0 bg-white" />
              </div>
              <p className="mt-4 text-[0.6rem] uppercase leading-5 tracking-[0.14em] text-white/40">
                Food · Shelter · Clothing · Sleep
              </p>
            </li>
            <li className="border border-white/15 p-5 text-white/30">
              <div className="flex items-center justify-between gap-5">
                <div>
                  <p className="font-mono text-[0.55rem] uppercase tracking-[0.18em]">Level II</p>
                  <h3 className="mt-2 text-xs font-semibold uppercase tracking-[0.16em]">Vision</h3>
                </div>
                <span className="rounded-full border border-white/20 px-2 py-1 text-[0.5rem] uppercase tracking-[0.12em]">Locked</span>
              </div>
            </li>
          </ol>
        ) : (
          <>
            <div className="relative py-8 pl-9">
              <span aria-hidden="true" className="absolute bottom-0 left-2.5 top-0 border-l border-dashed border-white/35" />
              <ol className="grid gap-3">
                {steps.map((step) => {
                  const selected = activeStep === step.id;
                  return (
                    <li className="relative" key={step.id}>
                      <span
                        aria-hidden="true"
                        className={`absolute -left-[1.925rem] top-1/2 size-2 -translate-y-1/2 ${
                          selected ? "bg-white" : "border border-white/40 bg-black"
                        }`}
                      />
                      <button
                        aria-pressed={selected}
                        className={`grid w-full grid-cols-[auto_minmax(0,1fr)] gap-5 px-2 py-1.5 text-left text-xs transition-colors ${
                          selected ? "text-white" : "text-white/40 hover:text-white/75"
                        }`}
                        onClick={() => onSelectStep(step.id)}
                        type="button"
                      >
                        <span className="font-mono tabular-nums">{String(step.id).padStart(2, "0")}</span>
                        <span className="flex flex-wrap justify-between gap-x-5 gap-y-1">
                          <span>{step.label}</span>
                          <span className="text-white/40">{step.option}</span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </div>

            <footer className="flex items-center gap-5 border-t border-white/20 pt-6">
              <svg aria-hidden="true" className="size-12 shrink-0" viewBox="0 0 48 48">
                <polygon fill="none" points="24,3 42,13.5 42,34.5 24,45 6,34.5 6,13.5" stroke="currentColor" strokeWidth="3" />
              </svg>
              <div>
                <p className="text-[0.6rem] uppercase tracking-[0.2em] text-white/40">Outcome</p>
                <p className="mt-1 text-xs text-white">Route complete</p>
              </div>
            </footer>
          </>
        )}
      </div>
      <div className="mt-6 flex justify-end">
        <button
          aria-label="Edit plan visualizer"
          className="inline-flex cursor-pointer items-center gap-2 border border-white/35 px-3 py-2 text-[0.55rem] font-semibold uppercase tracking-[0.14em] text-white/60 transition-colors hover:border-white hover:bg-white hover:text-black focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-3 focus-visible:outline-white"
          type="button"
        >
          <FiEdit2 aria-hidden="true" className="size-3.5" />
          Edit
        </button>
      </div>
    </section>
  );
}
