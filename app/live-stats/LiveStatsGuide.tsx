"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { useState } from "react";

export function LiveStatsGuide({ children }: { children: ReactNode }) {
  const [showGuide, setShowGuide] = useState(false);

  return (
    <div className="relative">
      {children}

      <div className="pointer-events-none absolute inset-0 z-10">
        {showGuide ? (
          <div className="relative h-screen w-screen overflow-hidden opacity-60">
            <Image
              alt="Live stats layout guide"
              className="object-contain object-top"
              fill
              priority
              src="/mockups/stats-guide.svg"
            />
          </div>
        ) : null}
      </div>

      <div className="fixed right-4 top-4 z-20 sm:right-6 sm:top-6">
        <button
          className="rounded-full border border-black bg-[#FEFCF1] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-black transition hover:bg-black hover:text-[#FEFCF1] focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 focus:ring-offset-[#d8d8dd]"
          onClick={() => setShowGuide((value) => !value)}
          type="button"
        >
          {showGuide ? "Hide Guide" : "Show Guide"}
        </button>
      </div>
    </div>
  );
}
