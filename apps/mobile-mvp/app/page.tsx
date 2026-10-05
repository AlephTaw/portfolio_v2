import Link from "next/link";
import { EarthPreviewTour } from "./components/landing/earth-preview-tour";

export default function LandingPage() {
  return (
    <main className="app-shell landing-background relative flex min-h-dvh flex-col">
      <EarthPreviewTour />
      <header className="relative z-10 flex min-h-12 items-center justify-between">
        <span className="bg-black px-3 py-2 font-mono text-[0.625rem] tracking-[0.2em] text-white/70">v0.1.0</span>
        <Link href="/bootloader" className="landing-sync group relative inline-flex min-h-11 items-center bg-black px-5 text-xs uppercase tracking-wider text-white focus-visible:outline-none">
          <svg aria-hidden="true" viewBox="0 0 120 44" className="landing-sync-border absolute inset-0 h-full w-full overflow-visible">
            <path className="landing-sync-path" pathLength="1" d="M60 42H104Q114 42 114 32V12Q114 2 104 2H16Q6 2 6 12V32Q6 42 16 42H60Z" fill="none" stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          </svg>
          <span className="relative">Enter</span>
        </Link>
      </header>
    </main>
  );
}
