"use client";

import { useEffect, useRef, useState } from "react";
import { SiDiscord, SiInstagram, SiTiktok, SiYoutube } from "react-icons/si";
import { Countdown } from "./countdown";
import { BetaSignupModal } from "./beta-signup-modal";
import { SyncIntroduction } from "../bootloader/sync-introduction";
import { OnboardingArrow } from "../landing/onboarding-arrow";

const socialLinks = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/",
    Icon: SiInstagram,
  },
  { label: "TikTok", href: "https://www.tiktok.com/", Icon: SiTiktok },
  { label: "YouTube", href: "https://www.youtube.com/", Icon: SiYoutube },
  { label: "Discord", href: "https://discord.com/", Icon: SiDiscord },
];

function scrollToSection(section: HTMLElement | null) {
  section?.scrollIntoView({
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
    block: "start",
  });
}

export function ComingSoonScreen({ transparentBackground = false, liveGameplay = false }: { transparentBackground?: boolean; liveGameplay?: boolean }) {
  const introduction = useRef<HTMLElement>(null);
  const [betaVisible, setBetaVisible] = useState(false);
  useEffect(() => {
    if (!new URLSearchParams(window.location.search).has("auth")) return;
    const frame = requestAnimationFrame(() => setBetaVisible(true));
    return () => cancelAnimationFrame(frame);
  }, []);
  return (
    <div className={`flex min-h-dvh flex-col text-foreground ${transparentBackground ? "bg-transparent" : "bg-black"}`}>
      <section id="coming-soon" aria-label="Launch countdown" className="relative flex min-h-dvh flex-col">
        <div aria-hidden="true" className="h-16 shrink-0" />
        <header className="fixed inset-x-0 top-0 z-10 flex h-16 items-center justify-between px-[clamp(1.5rem,4.4vw,3.5rem)]">
          <span style={{ opacity: "var(--landing-background-visibility, 1)" }} className="landing-glass-pill px-3 py-2 font-mono text-[0.625rem] tracking-[0.2em] text-white/70">
            v0.1.0
          </span>
          {liveGameplay && <span role="status" style={{ opacity: "var(--landing-background-visibility, 1)" }} className="landing-glass-pill inline-flex min-h-11 items-center gap-2 px-3 text-[0.625rem] uppercase tracking-wider text-white/70"><span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-yellow-400" />Live gameplay</span>}
        </header>

        <div className="flex flex-1 items-center justify-center px-6 pb-36 pt-16 text-center">
          <div>
            <Countdown />
            <h1 className="mt-4 text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
              Coming 01/27
            </h1>

            <div className="mt-12">
              <p className="text-sm text-white/65">Follow @speedrunirl</p>
              <nav
                aria-label="Follow Speedrun IRL"
                className="mt-5 flex flex-wrap items-start justify-center gap-8"
              >
                {socialLinks.map((social) => (
                  <a
                    aria-label={social.label}
                    className="group flex min-w-0 flex-col items-center gap-2 text-white focus:outline-none"
                    href={social.href}
                    key={social.label}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <span className="inline-flex size-10 items-center justify-center rounded-full border border-white bg-black text-white transition-colors group-hover:bg-white group-hover:text-black group-focus-visible:bg-white group-focus-visible:text-black group-focus-visible:ring-2 group-focus-visible:ring-white group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-black">
                      <social.Icon aria-hidden="true" className="size-4" />
                    </span>
                    <span className="min-h-4 text-xs font-medium opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
                      {social.label}
                    </span>
                  </a>
                ))}
              </nav>
            </div>
          </div>
        </div>
        <OnboardingArrow onContinue={() => scrollToSection(introduction.current)} />
      </section>
      <section ref={introduction} id="onboarding" aria-label="Game introduction" className={`app-shell ${transparentBackground ? "bg-transparent" : "bg-black"}`}>
        <SyncIntroduction embedded />
        <div className="pb-16 pt-4 text-center">
          <button
            type="button"
            className="inline-flex rounded-full border border-white px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white hover:text-black focus-visible:bg-white focus-visible:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            aria-expanded={betaVisible}
            aria-controls="beta-signup"
            aria-haspopup="dialog"
            onClick={() => setBetaVisible(true)}
          >
            Become a Beta Tester!
          </button>
        </div>
      </section>
      <BetaSignupModal open={betaVisible} onClose={() => setBetaVisible(false)} />
    </div>
  );
}
