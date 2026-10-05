"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { EarthTileReveal } from "./earth-tile-reveal";

// Normalized coordinates in the generated 1448 × 1086 image, not the viewport.
const earthImageSize = { width: 1448, height: 1086 };
const frameSequence = [
  { name: "Blue horizon", point: [0.49, 0.44], aspect: 4 / 3, mobileX: 0.05, desktopX: 0.85, y: 0.70 },
  { name: "Sunrise", point: [0.555, 0.52], aspect: 1.15, mobileX: 0.95, desktopX: 0.72, y: 0.66 },
  { name: "Orbital trail", point: [0.595, 0.61], aspect: 1, mobileX: 0.35, desktopX: 0.95, y: 0.73 },
] as const;
// Two identical three-frame cycles form the complete six-frame tour.
const stops = [...frameSequence, ...frameSequence];

const characterMetrics = [
  { name: "Health", value: "80 / 100 HP", detail: "Sleep 7 / 8h · Nutrition 2 / 3", progress: 0.8 },
  { name: "Wealth", value: "$120 / $180", detail: "Daily earning quota", progress: 2 / 3 },
  { name: "Connections", value: "2 / 4 IP", detail: "Daily interactions", progress: 0.5 },
  { name: "Sentience", value: "3 / 6 MP", detail: "Awareness · observability · feedback", progress: 0.5 },
  { name: "Skills", value: "1 / 2 SP", detail: "Math problem · ML abstract", progress: 0.5 },
] as const;

export function EarthPreviewTour() {
  const layerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [active, setActive] = useState(0);
  const [visible, setVisible] = useState(true);
  const [desert, setDesert] = useState(false);
  const [desertReady, setDesertReady] = useState(false);
  const [phase, setPhase] = useState<"frames" | "exit" | "transition">("frames");
  const [paused, setPaused] = useState(false);
  const clock = useRef({ stage: "", elapsed: 0 });
  const transitioning = phase === "transition" && desertReady;

  useEffect(() => {
    let cancelled = false;
    const image = new Image();
    image.src = "/landing-desert-planet-v3.png";
    image.decode().then(() => { if (!cancelled) setDesertReady(true); }).catch(() => {});
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;
    let frame = 0;
    const measure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const { width, height } = layer.getBoundingClientRect();
        setSize((previous) => previous.width === width && previous.height === height ? previous : { width, height });
      });
    };
    const observer = new ResizeObserver(measure);
    observer.observe(layer);
    measure();
    return () => { observer.disconnect(); cancelAnimationFrame(frame); };
  }, []);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const stage = `${active}-${phase}`;
    if (clock.current.stage !== stage) clock.current = { stage, elapsed: 0 };
    if (paused || reducedMotion.matches || (phase === "transition" && !desertReady)) return;
    const duration = phase === "frames" ? 5500 : phase === "exit" ? 350 : 2000;
    let previous = performance.now();
    const timer = setInterval(() => {
      const now = performance.now();
      const delta = now - previous;
      previous = now;
      if (document.hidden) return;
      clock.current.elapsed += delta;
      if (clock.current.elapsed < duration) return;
      clearInterval(timer);
      if (phase === "frames") {
        setVisible(false);
        setPhase("exit");
      } else if (phase === "exit") {
        if (active === 2 || active === stops.length - 1) {
          setPhase("transition");
          return;
        }
        setActive((index) => (index + 1) % stops.length);
        setPhase("frames");
        setVisible(true);
      } else {
        setDesert(!desert);
        setActive(desert ? 0 : 3);
        setPhase("frames");
        setVisible(true);
      }
    }, 25);
    return () => clearInterval(timer);
  }, [active, phase, desertReady, desert, paused]);

  const stop = stops[active];
  const { width, height } = size;
  const mobile = width < 768;
  // Mirrors CSS background-size: cover and background-position: center exactly.
  const scale = Math.max(width / earthImageSize.width, height / earthImageSize.height);
  const targetX = (width - earthImageSize.width * scale) / 2 + stop.point[0] * earthImageSize.width * scale;
  const targetY = (height - earthImageSize.height * scale) / 2 + stop.point[1] * earthImageSize.height * scale;
  const frameWidth = Math.min(width * (mobile ? 0.65 : 0.29), mobile ? 272 : 320, height * 0.28 * stop.aspect);
  const frameHeight = frameWidth / stop.aspect;
  const inset = 24;
  const preferredLeft = mobile
    ? inset + Math.max(0, width - frameWidth - inset * 2) * stop.mobileX
    : targetX - frameWidth / 2 + (stop.desktopX - 0.85) * frameWidth;
  const left = Math.max(inset, Math.min(preferredLeft, width - frameWidth - inset));
  const top = Math.max(160, Math.min(height * stop.y, height - frameHeight - 32));
  // Frames sit below their anchors on every breakpoint. Always use their top
  // face, with a vertical terminal segment perpendicular to that face.
  const startX = Math.max(left + 20, Math.min(targetX, left + frameWidth - 20));
  const startY = top;
  const bendX = startX;
  const bendY = startY - Math.min(32, Math.max(12, (startY - targetY) * 0.35));
  const upperTop = 96;
  // Mobile-sized detail screen: shrink to fit, but never grow on wider screens.
  const upperWidth = Math.min(width - inset * 2, 345);
  const upperLeft = (width - upperWidth) / 2;
  const upperHeight = Math.max(64, Math.min(256, height / 2 - upperTop - 24, targetY - upperTop - 32));
  const upperStartX = upperLeft + upperWidth / 2;
  const upperStartY = upperTop + upperHeight;
  const statusWidth = Math.min(width - 32, 390);
  const statusHeight = Math.min(390, Math.max(220, top - upperTop - 20));

  return (
    <div ref={layerRef} className="pointer-events-none absolute inset-0 overflow-hidden" style={{ "--earth-animation-state": paused ? "paused" : "running" } as CSSProperties}>
      {desert && <div className="absolute inset-0 bg-[url('/landing-desert-planet-v3.png')] bg-cover bg-center" />}
      {transitioning && width > 0 && <EarthTileReveal
        width={width} height={height}
        imageSrc={desert ? "/landing-earth-generated-v1.png" : "/landing-desert-planet-v3.png"}
        seed={desert ? 29063 : 7139}
      />}
      {width > 0 && <div aria-hidden="true" className="absolute inset-0 transition-opacity duration-300 motion-reduce:transition-none" style={{ opacity: visible ? 1 : 0 }}>
        <svg width={width} height={height} className="absolute inset-0 text-white/75">
          <path d={`M${startX},${startY} L${bendX},${bendY} L${targetX},${targetY}`} fill="none" stroke="currentColor" strokeWidth="1" />
          <circle cx={targetX} cy={targetY} r="2.5" fill="currentColor" />
        </svg>
        <div data-earth-preview={stop.name} className="absolute rounded-2xl border border-white bg-black" style={{ left, top, width: frameWidth, height: frameHeight }} />
        {active % 3 === 1 && <div key={active} className="earth-secondary-frame absolute inset-0">
          <svg width={width} height={height} className="absolute inset-0 text-white/75">
            <path d={`M${upperStartX},${upperStartY} L${upperStartX},${upperStartY + 20} L${targetX},${targetY}`} fill="none" stroke="currentColor" strokeWidth="1" />
          </svg>
          <div data-earth-preview="Sunrise detail" className="absolute rounded-2xl border border-white bg-black" style={{ left: upperLeft, top: upperTop, width: upperWidth, height: upperHeight }} />
        </div>}
        {active % 3 === 2 && <div key={`status-${active}`} data-earth-status className="earth-glass-status absolute flex flex-col gap-3 overflow-y-auto p-5" style={{ left: (width - statusWidth) / 2, top: upperTop, width: statusWidth, height: statusHeight }}>
          <div className="flex shrink-0 items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-white/70">Character status</span>
            <span className="ml-auto text-[10px] uppercase tracking-wider text-white/45">Demo</span>
            <span className="h-2 w-2 rounded-full bg-yellow-300 shadow-[0_0_10px_#fde04760]" />
          </div>
          <div className="flex min-h-0 flex-1 flex-col justify-between gap-3">
            {characterMetrics.map((metric) => <div key={metric.name}>
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="font-medium text-white/90">{metric.name}</span>
                <span className="text-xs tabular-nums text-white/75">{metric.value}</span>
              </div>
              <div className="my-1.5 h-1 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-white/65" style={{ width: `${metric.progress * 100}%` }} />
              </div>
              <p className="text-[11px] leading-4 text-white/55">{metric.detail}</p>
            </div>)}
          </div>
        </div>}
      </div>}
      <button type="button" aria-pressed={paused} onClick={() => setPaused((value) => !value)} className="pointer-events-auto absolute bottom-[max(1rem,env(safe-area-inset-bottom))] left-[max(1rem,env(safe-area-inset-left))] z-20 inline-flex min-h-11 items-center gap-2 rounded-full border border-white/20 bg-black/60 px-4 text-xs text-white/80 backdrop-blur-sm hover:text-white">
        <span aria-hidden="true">{paused ? "▶" : "Ⅱ"}</span>
        {paused ? "Resume" : "Pause"}
      </button>
    </div>
  );
}
