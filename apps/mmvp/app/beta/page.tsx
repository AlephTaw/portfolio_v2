import type { Metadata } from "next";
import Link from "next/link";
import { SignupForm } from "./signup-form";

export const metadata: Metadata = {
  title: "Beta Signup | Speedrun IRL",
  description: "Sign up to beta test Speedrun IRL.",
};

export default function BetaSignupPage() {
  return (
    <main className="flex min-h-dvh flex-col bg-background text-foreground">
      <header className="flex h-16 shrink-0 items-center justify-between px-[clamp(1.5rem,4.4vw,3.5rem)]">
        <span className="font-mono text-[0.625rem] uppercase tracking-[0.2em] text-white/70">
          Version 0.1.0
        </span>
        <Link
          className="text-xs uppercase tracking-[0.04em] text-white transition-opacity hover:opacity-60 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-white"
          href="/coming-soon"
        >
          Back
        </Link>
      </header>

      <section className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-xl">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/45">Beta Program</p>
          <h1 className="mt-5 text-[clamp(2.5rem,8vw,5.5rem)] font-semibold leading-[0.95] tracking-[-0.055em]">
            Become a Beta Tester!
          </h1>
          <p className="mb-10 mt-6 max-w-md text-base leading-7 text-white/60">
            Be among the first to speedrun IRL and help shape the game before launch.
          </p>
          <SignupForm />
        </div>
      </section>
    </main>
  );
}
