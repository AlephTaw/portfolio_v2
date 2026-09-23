"use client";

import { useState } from "react";
import { PlanVisualizer } from "./plan-visualizer";
import { storyboardSteps } from "./storyboard-data";
import { StoryboardPanel } from "./storyboard-panel";

export function StoryboardBuilder() {
  const [activeStep, setActiveStep] = useState(storyboardSteps[0].id);

  return (
    <div className="grid min-h-[28rem] gap-8 border border-white/20 p-[clamp(1.25rem,3vw,2.5rem)] lg:grid-cols-2 lg:gap-0">
      <PlanVisualizer activeStep={activeStep} onSelectStep={setActiveStep} steps={storyboardSteps} />
      <StoryboardPanel activeStep={activeStep} onSelectFrame={setActiveStep} steps={storyboardSteps} />
    </div>
  );
}
