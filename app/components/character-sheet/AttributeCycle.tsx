"use client";

import { useEffect, useState } from "react";

const attributes = [
  { label: "Experience", progress: 68, quest: "The Long Game" },
  { label: "Health", progress: 84, quest: "Vitality Protocol" },
  { label: "Wealth", progress: 42, quest: "Resource Engine" },
  { label: "Interaction", progress: 73, quest: "Social Fabric" },
  { label: "Personality", progress: 61, quest: "Know Thyself" },
  { label: "Volition", progress: 77, quest: "The Crucible" },
  { label: "Competence", progress: 70, quest: "Mastery Path" },
  { label: "Builds", progress: 35, quest: "Ship It" },
];

export function AttributeCycle() {
  const [index, setIndex] = useState(0);
  const attribute = attributes[index];

  useEffect(() => {
    const interval = window.setInterval(
      () => setIndex((current) => (current + 1) % attributes.length),
      9_600,
    );

    return () => window.clearInterval(interval);
  }, []);

  return (
    <div
      aria-label={`${attribute.label}: ${attribute.quest}, ${attribute.progress}% complete`}
      className="flex w-full items-center justify-between gap-4"
    >
      <p className="whitespace-nowrap text-left font-mono text-[0.5rem] uppercase tabular-nums text-[#4b4b4b] sm:text-[0.65rem]">
        {attribute.label}: {attribute.quest}
      </p>
      <div className="flex shrink-0 items-center justify-end gap-2">
        <div
          aria-hidden="true"
          className="h-1.5 w-20 border border-black sm:w-32"
        >
          <div
            className="h-full bg-black transition-[width] duration-500"
            style={{ width: `${attribute.progress}%` }}
          />
        </div>
        <span className="w-8 whitespace-nowrap text-right font-mono text-[0.5rem] uppercase tabular-nums text-[#4b4b4b] sm:text-[0.65rem]">
          {attribute.progress}%
        </span>
      </div>
    </div>
  );
}
