"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { EarthTileReveal } from "./earth-tile-reveal";
import { TourPlaybackControls } from "./tour-playback-controls";
import { CityPreviewShot } from "./city-preview-shot";
import { PlanetFlightTransition } from "./planet-flight-transition";
import { GameplayGridTransition } from "./gameplay-grid-transition";
import { gameplayRevealDuration } from "./gameplay-grid";
import { MealPrepVideo } from "./meal-prep-video";

// Anchors are normalized to the source image, not the viewport.
const scenes = [
  { image: "/landing-earth-generated-v1.png", seed: 7139 },
  { image: "/landing-desert-planet-v3.png", seed: 43127 },
  { image: "/landing-desert-city-local-repair-v6.png", seed: 29063 },
] as const;
const frameSequence = [
  { name: "Blue horizon", point: [0.49, 0.44], aspect: 4 / 3, mobileX: 0.05, desktopX: 0.85, y: 0.70 },
  { name: "Sunrise", point: [0.555, 0.52], aspect: 1.15, mobileX: 0.95, desktopX: 0.72, y: 0.66 },
  { name: "Orbital trail", point: [0.595, 0.61], aspect: 1, mobileX: 0.35, desktopX: 0.95, y: 0.73 },
] as const;
// Repeat the same three-frame choreography once per background.
const stops = [...frameSequence, ...frameSequence, ...frameSequence];

const characterMetrics = [
  { name: "Health", value: "80 / 100 HP", detail: "Sleep 7 / 8h · Nutrition 2 / 3", progress: 0.8 },
  { name: "Wealth", value: "$120 / $180", detail: "Daily earning quota", progress: 2 / 3 },
  { name: "Connections", value: "2 / 4 IP", detail: "Daily interactions", progress: 0.5 },
  { name: "Sentience", value: "3 / 6 MP", detail: "Awareness · observability · feedback", progress: 0.5 },
  { name: "Skills", value: "1 / 2 SP", detail: "Math problem · ML abstract", progress: 0.5 },
] as const;

export function EarthPreviewTour({ suspended = false, onLiveGameplayChange, onFinalVideoEnd }: { suspended?: boolean; onLiveGameplayChange?: (live: boolean) => void; onFinalVideoEnd?: () => void }) {
  const layerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [active, setActive] = useState(0);
  const [visible, setVisible] = useState(true);
  const [imageSizes, setImageSizes] = useState<Record<string, { width: number; height: number }>>({});
  const [phase, setPhase] = useState<"frames" | "expand" | "complete" | "exit" | "transition">("frames");
  const [playbackPaused, setPlaybackPaused] = useState(false);
  const paused = suspended || playbackPaused;
  const [speed, setSpeed] = useState(4);
  const [flightState, setFlightState] = useState<"loading" | "ready" | "error">("loading");
  const showSeekedFrame = useRef(false);
  const clock = useRef({ stage: "", elapsed: 0 });
  const sceneIndex = Math.floor(active / frameSequence.length);
  const scene = scenes[sceneIndex];
  const nextScene = scenes[(sceneIndex + 1) % scenes.length];
  const nextReady = !!imageSizes[nextScene.image] && (sceneIndex !== 1 || flightState !== "loading");
  const transitioning = phase === "transition" && nextReady;
  const flightActive = transitioning && sceneIndex === 1 && flightState === "ready";
  const liveGameplay = phase === "complete";

  useEffect(() => { onLiveGameplayChange?.(liveGameplay); }, [liveGameplay, onLiveGameplayChange]);

  const flightReady = useCallback(() => setFlightState("ready"), []);
  const flightUnavailable = useCallback(() => setFlightState("error"), []);
  const completeFlight = useCallback(() => {
    setActive((index) => (index + 1) % stops.length);
    setPhase("frames");
    setVisible(true);
  }, []);

  // Retiming the existing animations preserves their position when speed changes.
  // Their original durations remain the 1× baseline shared with the tour clock.
  useLayoutEffect(() => {
    layerRef.current?.getAnimations({ subtree: true }).forEach((animation) => {
      if (animation instanceof CSSAnimation) {
        if (animation.playbackRate !== speed) animation.updatePlaybackRate(speed);
        // Stepping while paused should display the entire destination frame.
        if (showSeekedFrame.current) animation.finish();
      }
    });
    showSeekedFrame.current = false;
  }, [speed, active, phase, transitioning, size]);

  function seek(direction: -1 | 1) {
    const target = Math.max(0, Math.min(active + direction, stops.length - 1));
    if (!imageSizes[scenes[Math.floor(target / frameSequence.length)].image]) return;
    showSeekedFrame.current = paused;
    clock.current = { stage: "", elapsed: 0 };
    setActive(target);
    setPhase("frames");
    setVisible(true);
  }

  useEffect(() => {
    let cancelled = false;
    scenes.forEach(({ image: src }) => {
      const image = new Image();
      image.src = src;
      image.decode().then(() => {
        if (!cancelled) setImageSizes((sizes) => ({ ...sizes, [src]: { width: image.naturalWidth, height: image.naturalHeight } }));
      }).catch(() => {});
    });
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
    if (phase === "complete" || paused || (reducedMotion.matches && active !== stops.length - 1) || (phase === "transition" && !nextReady)) return;
    // Actual media playback owns the flight duration, including buffering.
    // On a load/playback failure, advance directly to the city without stalling.
    if (phase === "transition" && sceneIndex === 1 && flightState !== "error") return;
    const duration = phase === "frames" ? active === stops.length - 1 ? gameplayRevealDuration : 5500 : phase === "expand" ? 1500 : phase === "exit" ? 350 : 2000;
    let previous = performance.now();
    const timer = setInterval(() => {
      const now = performance.now();
      const delta = now - previous;
      previous = now;
      if (document.hidden) return;
      clock.current.elapsed += delta * speed;
      if (clock.current.elapsed < duration) return;
      clearInterval(timer);
      if (phase === "frames") {
        if (active === stops.length - 1) {
          setPhase("complete");
          return;
        }
        setVisible(false);
        setPhase("exit");
      } else if (phase === "expand") {
        setPhase("complete");
      } else if (phase === "exit") {
        if (active % frameSequence.length === frameSequence.length - 1) {
          setPhase("transition");
          return;
        }
        setActive((index) => (index + 1) % stops.length);
        setPhase("frames");
        setVisible(true);
      } else {
        setActive((index) => (index + 1) % stops.length);
        setPhase("frames");
        setVisible(true);
      }
    }, 25);
    return () => clearInterval(timer);
  }, [active, phase, nextReady, paused, speed, sceneIndex, flightState]);

  const stop = stops[active];
  const { width, height } = size;
  const mobile = width < 768;
  const earthImageSize = imageSizes[scene.image] ?? { width: 1448, height: 1086 };
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
    <div ref={layerRef} data-tour-scene={sceneIndex} data-tour-phase={phase} className="pointer-events-none absolute inset-0 overflow-hidden" style={{ "--earth-animation-state": paused ? "paused" : "running", "--earth-frame-fade": `${(visible ? 600 : 300) / speed}ms` } as CSSProperties}>
      {sceneIndex > 0 && <div className="absolute inset-0 bg-black bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url('${scene.image}')` }} />}
      {transitioning && sceneIndex !== 1 && width > 0 && <EarthTileReveal
        width={width} height={height}
        imageSrc={nextScene.image} imageSize={imageSizes[nextScene.image]}
        seed={scene.seed} fullCoverage={sceneIndex > 0}
      />}
      <PlanetFlightTransition active={flightActive} paused={paused} speed={speed}
        onReady={flightReady} onComplete={completeFlight} onUnavailable={flightUnavailable} />
      {width > 0 && <div aria-hidden="true" className="absolute inset-0 transition-opacity duration-[var(--earth-frame-fade)] motion-reduce:transition-none" style={{ opacity: visible ? 1 : 0 }}>
        {sceneIndex === 2 ? active !== stops.length - 1 && <CityPreviewShot width={width} height={height} imageSize={earthImageSize} shot={1 - active % 3} paused={paused} phase={phase} clock={clock} /> : <>
        <svg width={width} height={height} className="absolute inset-0 text-white/75">
          <path d={`M${startX},${startY} L${bendX},${bendY} L${targetX},${targetY}`} fill="none" stroke="currentColor" strokeWidth="1" />
          <circle cx={targetX} cy={targetY} r="2.5" fill="currentColor" />
        </svg>
        <div key={`preview-${active}`} data-earth-preview={stop.name} className="earth-preview-panel absolute overflow-hidden rounded-2xl bg-black" style={{ left, top, width: frameWidth, height: frameHeight }}>
          {active === 2 && <MealPrepVideo paused={paused || phase !== "frames"} speed={speed} />}
        </div>
        {active % 3 === 1 && <div key={active} className="earth-secondary-frame absolute inset-0">
          <svg width={width} height={height} className="absolute inset-0 text-white/75">
            <path d={`M${upperStartX},${upperStartY} L${upperStartX},${upperStartY + 20} L${targetX},${targetY}`} fill="none" stroke="currentColor" strokeWidth="1" />
          </svg>
          <div data-earth-preview="Sunrise detail" className="earth-preview-panel absolute rounded-2xl bg-black" style={{ left: upperLeft, top: upperTop, width: upperWidth, height: upperHeight }} />
        </div>}
        {active % 3 === 2 && <div key={`status-${active}`} data-earth-status className="earth-glass-status absolute flex flex-col gap-3 overflow-y-auto p-5" style={{ left: (width - statusWidth) / 2, top: upperTop - 38, width: statusWidth, height: statusHeight }}>
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
        </>}
        {active === stops.length - 1 && <GameplayGridTransition width={width} height={height} imageSrc={scene.image}
          clock={clock} complete={phase === "complete"} paused={paused} speed={speed} onVideoEnd={onFinalVideoEnd} />}
      </div>}
      {!suspended && <TourPlaybackControls paused={paused} speed={speed} onTogglePause={() => setPlaybackPaused((value) => !value)} onSeek={seek} onSpeedChange={setSpeed}
        canRewind={active > 0 && !!imageSizes[scenes[Math.floor(Math.max(0, active - 1) / frameSequence.length)].image]}
        canForward={active < stops.length - 1 && !!imageSizes[scenes[Math.floor(Math.min(active + 1, stops.length - 1) / frameSequence.length)].image]} />}
    </div>
  );
}
