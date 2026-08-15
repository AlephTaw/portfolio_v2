"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

function SignalLines() {
  return (
    <span aria-hidden="true" className="grid h-full grid-rows-4 items-center">
      <span className="h-px bg-[#cf1212]" />
      <span className="h-px bg-[#f8db3c]" />
      <span className="h-px bg-[#6bb511]" />
      <span className="h-px bg-[#0ac2f0]" />
    </span>
  );
}

function SirlLogo() {
  return (
    <div className="grid grid-cols-[minmax(2rem,1fr)_auto_minmax(2rem,1fr)] items-stretch gap-3 sm:gap-6">
      <SignalLines />
      <p className="text-center text-2xl font-black leading-none text-[#f1f3f3] sm:text-3xl">
        SIRL
      </p>
      <SignalLines />
    </div>
  );
}

function TypewriterText({
  delayMs,
  reduceMotion,
}: {
  delayMs: number;
  reduceMotion: boolean;
}) {
  const text = "welcome to the game of life";
  const [visibleLength, setVisibleLength] = useState(0);

  useEffect(() => {
    if (reduceMotion) {
      return;
    }

    let animationFrame = 0;
    let startedAt = 0;

    function typeNextFrame(now: number) {
      const progress = Math.min(1, (now - startedAt) / 1990);
      setVisibleLength(Math.floor(progress * text.length));

      if (progress < 1) {
        animationFrame = window.requestAnimationFrame(typeNextFrame);
      }
    }

    const startTimer = window.setTimeout(() => {
      startedAt = performance.now();
      animationFrame = window.requestAnimationFrame(typeNextFrame);
    }, delayMs);

    return () => {
      window.clearTimeout(startTimer);
      window.cancelAnimationFrame(animationFrame);
    };
  }, [delayMs, reduceMotion]);

  const displayedLength = reduceMotion ? text.length : visibleLength;
  const isTyping = displayedLength > 0 && displayedLength < text.length;

  return (
    <span className="relative inline-grid min-h-6 items-center font-mono text-base font-normal text-[#f1f3f3]">
      <span className="invisible whitespace-nowrap">{text}</span>
      <span
        aria-hidden="true"
        className="absolute left-0 top-1/2 -translate-y-1/2 whitespace-nowrap"
      >
        {text.slice(0, displayedLength)}
        <span
          className={`absolute left-full top-1/2 ml-3 h-6 w-3 -translate-y-1/2 bg-[#f1f3f3] ${
            isTyping ? "opacity-100" : "opacity-0"
          }`}
        />
      </span>
    </span>
  );
}

const panels = [
  { className: "left-[4%] top-[9%] w-[31%]", src: "/sirl-entry/panel-3.png" },
  { className: "left-[18%] top-[37%] w-[62%]", src: "/sirl-entry/panel-2.png" },
  { className: "right-[4%] top-[66%] w-[31%]", src: "/sirl-entry/panel-4.png" },
  { className: "left-[12%] top-[77%] w-[38%]", src: "/sirl-entry/panel-5.png" },
] as const;

const transition = { duration: 3.5, ease: [0.22, 1, 0.24, 1] } as const;

export function SirlAuthBackground() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      aria-label="SIRL authentication background animation"
      className="relative mx-auto aspect-video w-full max-w-3xl overflow-hidden border border-black bg-black"
    >
      <div className="absolute inset-0 flex items-center justify-center text-[#f1f3f3]">
        <div className="w-full">
          <SirlLogo />
          <p className="mt-8 text-center">
            <TypewriterText
              delayMs={2000}
              reduceMotion={Boolean(reduceMotion)}
            />
          </p>
        </div>
      </div>

      <div className="absolute inset-0 overflow-hidden">
        {panels.map((panel, index) => (
          <motion.img
            alt=""
            animate={{
              opacity: 0,
              scale: 0.85,
              y: index % 2 === 0 ? 200 : -250,
            }}
            aria-hidden="true"
            className={`absolute box-border border-4 border-zinc-200 ${panel.className}`}
            initial={
              reduceMotion
                ? false
                : {
                    opacity: 1,
                    scale: 1,
                    y: index % 2 === 0 ? -200 : 200,
                  }
            }
            key={panel.src}
            src={panel.src}
            transition={reduceMotion ? { duration: 0 } : transition}
          />
        ))}
      </div>
    </section>
  );
}
