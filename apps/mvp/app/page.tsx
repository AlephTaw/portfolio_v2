import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-dvh flex-col overflow-hidden bg-background text-foreground">
      <header className="flex h-16 shrink-0 items-center justify-between px-[clamp(1.5rem,4.4vw,3.5rem)]">
        <span className="font-mono text-[0.625rem] uppercase tracking-[0.2em] text-white/70">
          Version 0.1.0
        </span>
        <Link
          className="text-xs uppercase tracking-[0.04em] text-white transition-opacity hover:opacity-60 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-white"
          href="/join"
        >
          Join
        </Link>
      </header>

      <section className="relative mx-auto grid w-full max-w-[71.25rem] flex-1 grid-cols-[minmax(0,1fr)_minmax(12rem,0.72fr)] items-center gap-[clamp(3rem,8vw,8rem)] px-[clamp(2.5rem,6.6vw,5.3rem)] pb-16 max-md:grid-cols-1 max-md:content-center max-md:gap-12 max-md:py-12">
        <div className="landing-copy relative z-10 w-full max-w-[21.75rem]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt="Speedrun IRL"
            className="block h-auto w-full"
            src="/line1.svg"
          />
          <p className="mt-4 text-right text-[1rem] leading-normal text-white/90">
            Welcome to the game of life!
          </p>
        </div>

        <div
          aria-label="Live game preview"
          className="mx-auto aspect-[0.46] w-[clamp(11rem,19vw,15rem)] border-[6px] border-[#f2f2f2] max-md:w-[min(52vw,13rem)]"
          role="img"
        />
      </section>
    </main>
  );
}
