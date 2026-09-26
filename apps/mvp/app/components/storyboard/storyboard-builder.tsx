"use client";

import { useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { PlanVisualizer } from "./plan-visualizer";
import { storyboardSteps } from "./storyboard-data";
import { StoryboardPanel } from "./storyboard-panel";

export function StoryboardContent() {
  const [activeStep, setActiveStep] = useState(storyboardSteps[0].id);
  return (
    <div className="grid min-w-0 gap-8 lg:grid-cols-2 lg:gap-0">
      <PlanVisualizer activeStep={activeStep} onSelectStep={setActiveStep} steps={storyboardSteps} />
      <StoryboardPanel activeStep={activeStep} onSelectFrame={setActiveStep} steps={storyboardSteps} />
    </div>
  );
}

export function StoryboardBuilder({ statsContent }: { statsContent?: ReactNode }) {
  const [view, setView] = useState<"os" | "stats">("os");

  return (
    <div className="w-full">
      <div className="mb-4 flex justify-end" aria-label="OS and stats views" role="tablist">
        <div className="flex w-fit items-center rounded-full border border-white/35 p-0.5">
          {(["os", ...(statsContent ? ["stats" as const] : [])] as const).map((option) => (
            <button
              aria-controls={`storyboard-${option}-view`}
              aria-selected={view === option}
              className={`relative cursor-pointer rounded-full px-3 py-1 text-[0.55rem] font-semibold uppercase tracking-[0.12em] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white ${view === option ? "text-black" : "text-white/55 hover:text-white"}`}
              id={`storyboard-${option}-tab`}
              key={option}
              onClick={() => setView(option)}
              role="tab"
              type="button"
            >
              {view === option && <motion.span aria-hidden="true" className="absolute inset-0 rounded-full bg-white" layoutId="storyboard-view-fill" transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }} />}
              <span className="relative z-10">{option}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="min-h-[28rem]">
        {view === "stats" ? (
          <div aria-labelledby="storyboard-stats-tab" className="min-h-72" id="storyboard-stats-view" role="tabpanel">
            {statsContent}
          </div>
        ) : (
          <div aria-labelledby="storyboard-os-tab" className="min-h-72" id="storyboard-os-view" role="tabpanel">
            <section>
              <div className="grid w-full place-items-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img alt="MVSOS v0.1.0" className="h-auto max-h-[32rem] w-full max-w-[32rem] object-contain" src="/mvsos.svg" />
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
