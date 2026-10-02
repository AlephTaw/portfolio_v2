"use client";

import { useSyncExternalStore } from "react";
import { adminLabelClass } from "./admin-styles";
import { applyTheme, getTheme, subscribeTheme } from "../theme-preference";

export function AppearanceSection() {
  const theme = useSyncExternalStore(subscribeTheme, getTheme, () => "dark");

  return (
    <section className="mx-auto mt-16 w-full max-w-2xl border-t border-white/20 pt-10 text-white">
      <h2 className={adminLabelClass}>Appearance</h2>
      <p className="mt-2 text-sm leading-6 text-white/45">Choose how the workspace is displayed on this device.</p>
      <div aria-label="Color theme" className="mt-4 inline-flex rounded-lg border border-white/25 p-0.5" role="group">
        {(["light", "dark"] as const).map((option) => (
          <button
            aria-pressed={theme === option}
            className={`min-w-20 rounded-md px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition-colors ${
              theme === option ? "bg-white text-black" : "text-white/55"
            }`}
            key={option}
            onClick={() => {
              applyTheme(option);
            }}
            type="button"
          >
            {option === "light" ? "Light" : "Dark"}
          </button>
        ))}
      </div>
    </section>
  );
}
