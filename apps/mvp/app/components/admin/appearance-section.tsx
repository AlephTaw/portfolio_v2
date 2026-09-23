"use client";

import { useState } from "react";
import { adminLabelClass } from "./admin-styles";

export function AppearanceSection() {
  const [theme, setTheme] = useState<"Light" | "Dark">("Dark");

  return (
    <section>
      <h2 className={adminLabelClass}>Appearance</h2>
      <p className="mt-2 text-sm leading-6 text-white/45">Choose how the workspace is displayed on this device.</p>
      <div className="mt-4 inline-flex border border-white p-0.5">
        {(["Light", "Dark"] as const).map((option) => (
          <button
            aria-pressed={theme === option}
            className={`min-w-20 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] ${
              theme === option ? "bg-white text-black" : "text-white/55"
            }`}
            key={option}
            onClick={() => setTheme(option)}
            type="button"
          >
            {option}
          </button>
        ))}
      </div>
    </section>
  );
}
