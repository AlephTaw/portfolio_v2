"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { EarthPreviewTour } from "./components/landing/earth-preview-tour";
import { ComingSoonScreen } from "./components/coming-soon/coming-soon-screen";

export default function LandingPage() {
  const landingRef = useRef<HTMLElement>(null);
  const [liveGameplay, setLiveGameplay] = useState(false);
  const [signupVisible, setSignupVisible] = useState(false);
  const [retainVideo, setRetainVideo] = useState(false);
  useEffect(() => {
    if (!new URLSearchParams(window.location.search).has("auth")) return;
    const frame = requestAnimationFrame(() => setSignupVisible(true));
    return () => cancelAnimationFrame(frame);
  }, []);
  const onTourComplete = useCallback((live: boolean) => {
    setLiveGameplay(live);
  }, []);
  const onFinalVideoEnd = useCallback(() => {
    setRetainVideo(true);
    setSignupVisible(true);
  }, []);
  return (
    <main className="min-h-dvh bg-black">
      <section ref={landingRef} className="app-shell landing-background relative flex h-dvh flex-col" aria-label="Landing animation" style={{ backgroundImage: retainVideo ? "none" : undefined }}>
      <div className="contents" inert={signupVisible}>
      <div className="absolute inset-0" style={{ opacity: retainVideo ? "var(--landing-background-visibility, 1)" : undefined }}>
      <EarthPreviewTour suspended={signupVisible} onLiveGameplayChange={onTourComplete} onFinalVideoEnd={onFinalVideoEnd} />
      </div>
      <header className="relative z-10 flex min-h-12 items-center justify-between gap-3" style={{ visibility: signupVisible ? "hidden" : undefined }}>
        <span className="landing-glass-pill px-3 py-2 font-mono text-[0.625rem] tracking-[0.2em] text-white/70">v0.1.0</span>
        <div className="ml-auto flex items-center gap-2">
        {liveGameplay && <span role="status" className="landing-live-gameplay landing-glass-pill inline-flex min-h-11 items-center gap-2 px-3 text-[0.625rem] uppercase tracking-wider text-white/70"><span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-yellow-400" />Live gameplay</span>}
        <button type="button" onClick={() => setSignupVisible(true)} className="landing-glass-pill landing-sync group relative inline-flex min-h-11 items-center px-5 text-xs uppercase tracking-wider text-white focus-visible:outline-none">
          <svg aria-hidden="true" viewBox="0 0 120 44" className="landing-sync-border absolute inset-0 h-full w-full overflow-visible">
            <path className="landing-sync-path" pathLength="1" d="M60 42H104Q114 42 114 32V12Q114 2 104 2H16Q6 2 6 12V32Q6 42 16 42H60Z" fill="none" stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          </svg>
          <span className="relative">Enter</span>
        </button>
        </div>
      </header>
      </div>
      {signupVisible && <section aria-label="Coming soon and beta signup" className={`landing-signup-screen absolute inset-0 z-30 overflow-y-auto ${retainVideo ? "bg-transparent" : "bg-black"}`}
        onScroll={(event) => {
          if (!retainVideo) return;
          const container = event.currentTarget;
          const progress = Math.min(1, Math.max(0, container.scrollTop / (container.clientHeight * 0.65)));
          landingRef.current?.style.setProperty("--landing-background-visibility", String(1 - progress));
        }}><ComingSoonScreen transparentBackground={retainVideo} liveGameplay={retainVideo && liveGameplay} /></section>}
      </section>
    </main>
  );
}
