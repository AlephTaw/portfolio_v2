"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

export function CharacterSheetSectionPage({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-background px-5 py-8 text-[#191919] sm:px-8 lg:px-10">
      <div className="mx-auto w-full max-w-3xl">
        <button
          className="text-xs font-semibold uppercase tracking-[0.32em] text-[#766b5d] transition-colors hover:text-black focus:outline-none focus-visible:text-black focus-visible:underline"
          onClick={() => {
            if (window.history.length > 1) router.back();
            else router.push("/live-stats/campaign-summary");
          }}
          type="button"
        >
          Back
        </button>
        <div className="mx-auto mt-8 w-full max-w-xl">
          <section
            aria-label={title}
            className="min-w-0 [&>:first-child]:!mt-0"
          >
            {children}
          </section>
        </div>
      </div>
    </main>
  );
}
