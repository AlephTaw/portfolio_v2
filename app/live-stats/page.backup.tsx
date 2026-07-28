import type { Metadata } from "next";
import Link from "next/link";
import { ConwayLife } from "../ConwayLife";

export const metadata: Metadata = {
  title: "Live Stats - Steven Wilcox",
  description: "Game of Life live stats page.",
};

export default function LiveStatsPage() {
  return (
    <main className="min-h-screen bg-[#FEFCF1] px-5 py-8 text-[#191714] sm:px-8 lg:px-10">
      <div className="mx-auto max-w-5xl">
        <Link
          className="text-xs font-semibold uppercase tracking-[0.32em] text-[#766b5d]"
          href="/"
        >
          Back
        </Link>

        <header className="mx-auto flex min-h-[32vh] max-w-3xl flex-col items-center justify-center text-center">
          <h1 className="text-3xl font-light leading-tight sm:text-4xl">
            Live Stats
          </h1>
          <p className="mt-5 max-w-2xl font-serif text-xl font-thin italic leading-[1.08] text-[#615754]">
            “Welcome to the Game of Life”
          </p>
        </header>

        <div className="mx-auto aspect-[1.62/1] w-full max-w-[38rem] overflow-hidden border border-black">
          <ConwayLife />
        </div>
      </div>
    </main>
  );
}
