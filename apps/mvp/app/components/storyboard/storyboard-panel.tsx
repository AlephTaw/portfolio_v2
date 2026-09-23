"use client";

import { useState } from "react";
import { FiEdit2 } from "react-icons/fi";
import type { StoryboardStep } from "./storyboard-data";

const mapPositions = [
  { left: "12%", top: "68%" },
  { left: "34%", top: "30%" },
  { left: "62%", top: "52%" },
  { left: "84%", top: "18%" },
];

export function StoryboardPanel({
  activeStep,
  onSelectFrame,
  steps,
}: {
  activeStep: number;
  onSelectFrame: (step: number) => void;
  steps: StoryboardStep[];
}) {
  const [mapOpen, setMapOpen] = useState(false);

  return (
    <section aria-labelledby="storyboard-panel-title" className="min-w-0 border-t border-white/20 pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
      <header className="flex min-h-10 items-center justify-between gap-4">
        <div>
          <p className="text-[0.6rem] uppercase tracking-[0.2em] text-white/40">Sequence</p>
          <h2 className="mt-1 text-sm font-semibold text-white" id="storyboard-panel-title">Storyboard</h2>
        </div>
        <div className="flex items-center gap-3">
          <p className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-white/40">
            {String(activeStep).padStart(2, "0")} / {String(steps.length).padStart(2, "0")}
          </p>
          <button
            aria-controls="storyboard-panel-content"
            aria-pressed={mapOpen}
            className={`cursor-pointer rounded-full border px-3 py-1 text-[0.55rem] font-semibold uppercase tracking-[0.14em] transition-colors focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white ${
              mapOpen
                ? "border-white bg-white text-black"
                : "border-white/40 bg-transparent text-white/65 hover:border-white hover:text-white"
            }`}
            onClick={() => setMapOpen((open) => !open)}
            type="button"
          >
            Map
          </button>
        </div>
      </header>

      <div id="storyboard-panel-content">
        {mapOpen ? (
          <div
            aria-label="Storyboard route map"
            className="relative mt-6 aspect-[4/3] min-h-72 overflow-hidden border border-white/25 bg-black bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.12)_1px,transparent_1px)] bg-[size:18px_18px]"
          >
            <svg aria-hidden="true" className="absolute inset-0 size-full" preserveAspectRatio="none" viewBox="0 0 100 100">
              <polyline
                fill="none"
                points="12,68 34,30 62,52 84,18"
                stroke="rgba(255,255,255,0.55)"
                strokeDasharray="2 2"
                strokeWidth="0.8"
              />
            </svg>
            {steps.map((step, index) => {
              const selected = activeStep === step.id;
              const position = mapPositions[index] ?? mapPositions[mapPositions.length - 1];
              return (
                <button
                  aria-label={`Select map step ${step.id}: ${step.frameLabel}`}
                  aria-pressed={selected}
                  className={`absolute grid size-10 -translate-x-1/2 -translate-y-1/2 cursor-pointer place-items-center rounded-full border font-mono text-[0.55rem] transition-colors focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-3 focus-visible:outline-white ${
                    selected
                      ? "border-white bg-white text-black"
                      : "border-white/55 bg-black text-white/65 hover:border-white hover:text-white"
                  }`}
                  key={step.id}
                  onClick={() => onSelectFrame(step.id)}
                  style={position}
                  title={step.frameLabel}
                  type="button"
                >
                  {String(step.id).padStart(2, "0")}
                </button>
              );
            })}
          </div>
        ) : (
          <ol className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
            {steps.map((step) => {
              const selected = activeStep === step.id;
              return (
                <li key={step.id}>
                  <button
                    aria-label={`Select storyboard frame ${step.id}: ${step.frameLabel}`}
                    aria-pressed={selected}
                    className={`group aspect-[4/3] w-full border bg-black text-left transition-colors ${
                      selected
                        ? "border-solid border-white"
                        : "border-dashed border-white/35 hover:border-white/70"
                    }`}
                    onClick={() => onSelectFrame(step.id)}
                    type="button"
                  >
                    <span className="flex h-full flex-col justify-between p-3">
                      <span className="font-mono text-[0.55rem] tabular-nums text-white/40">
                        {String(step.id).padStart(2, "0")}
                      </span>
                      <span className={`text-[0.6rem] uppercase tracking-[0.16em] ${selected ? "text-white" : "text-white/35 group-hover:text-white/70"}`}>
                        {step.frameLabel}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
            <li>
              <button
                aria-label="Add storyboard frame"
                className="grid aspect-[4/3] w-full place-items-center border border-dashed border-white/20 text-xl font-light text-white/30 transition-colors hover:border-white/60 hover:text-white"
                type="button"
              >
                +
              </button>
            </li>
          </ol>
        )}
      </div>
      <div className="mt-6 flex justify-end">
        <button
          aria-label="Edit storyboard sequence"
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
