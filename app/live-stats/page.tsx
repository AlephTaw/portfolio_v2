import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Live Stats - Steven Wilcox",
  description: "Live stats page coming soon.",
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
            &quot;Welcome to the Game of Life&quot;
          </p>
        </header>

        <div className="mx-auto w-full max-w-[38rem] border border-black p-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#766b5d]">
            Coming Soon
          </p>
        </div>
      </div>
    </main>
  );
}
