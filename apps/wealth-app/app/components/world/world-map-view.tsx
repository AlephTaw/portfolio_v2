"use client";

import { useEffect, useId, useRef, useState, type PointerEvent } from "react";
import { circleCoverCamera, constrainCamera, INITIAL_CAMERA, MAP_HEIGHT, MAP_WIDTH, MAX_SCALE, MIN_SCALE, zoomCamera, type MapCamera, type Point } from "./map-camera";
import { BuildingLayer } from "./building-layer";

const CENTER = { x: 836, y: 470.5 };
const RADIUS = 445;

export function WorldMapView({ buildingLayer = false, fixedFraming = false }: { buildingLayer?: boolean; fixedFraming?: boolean }) {
  const edgeId = useId();
  const svg = useRef<SVGSVGElement>(null);
  const scene = useRef<SVGGElement>(null);
  const [camera, setCamera] = useState<MapCamera>(INITIAL_CAMERA);
  const [buildingsVisible, setBuildingsVisible] = useState(true);
  const [includeEstimates, setIncludeEstimates] = useState(true);
  const pointers = useRef(new Map<number, Point>());
  const viewCamera = fixedFraming ? circleCoverCamera(RADIUS) : camera;

  // One unrotated scene; SVG slice centers the circle and crops like object-fit: cover.
  // Screen transforms keep map gestures aligned with that responsive crop.
  function point(clientX: number, clientY: number): Point {
    const matrix = scene.current?.getScreenCTM();
    if (!matrix) return { x: 0, y: 0 };
    const local = new DOMPoint(clientX, clientY).matrixTransform(matrix.inverse());
    return { x: local.x - CENTER.x, y: local.y - CENTER.y };
  }
  function start(event: PointerEvent<SVGCircleElement>) {
    if (event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    pointers.current.set(event.pointerId, point(event.clientX, event.clientY));
  }
  function move(event: PointerEvent<SVGCircleElement>) {
    const previous = pointers.current.get(event.pointerId);
    if (!previous) return;
    const next = point(event.clientX, event.clientY);
    const other = [...pointers.current.entries()].find(([id]) => id !== event.pointerId)?.[1];
    setCamera((current) => {
      if (!other) return constrainCamera({ ...current, x: current.x + next.x - previous.x, y: current.y + next.y - previous.y });
      const oldDistance = Math.hypot(previous.x - other.x, previous.y - other.y);
      const newDistance = Math.hypot(next.x - other.x, next.y - other.y);
      const oldCenter = { x: (previous.x + other.x) / 2, y: (previous.y + other.y) / 2 };
      const newCenter = { x: (next.x + other.x) / 2, y: (next.y + other.y) / 2 };
      const zoomed = zoomCamera(current, current.scale * newDistance / Math.max(1, oldDistance), oldCenter);
      return constrainCamera({ ...zoomed, x: zoomed.x + newCenter.x - oldCenter.x, y: zoomed.y + newCenter.y - oldCenter.y });
    });
    pointers.current.set(event.pointerId, next);
  }
  function end(event: PointerEvent<SVGCircleElement>) { pointers.current.delete(event.pointerId); }
  useEffect(() => {
    if (fixedFraming) return;
    const element = svg.current;
    if (!element) return;
    function wheel(event: globalThis.WheelEvent) {
      const matrix = scene.current?.getScreenCTM();
      if (!matrix) return;
      const local = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
      const anchor = { x: local.x - CENTER.x, y: local.y - CENTER.y };
      if (Math.hypot(anchor.x, anchor.y) > RADIUS) return;
      event.preventDefault();
      const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? 400 : 1);
      setCamera((current) => zoomCamera(current, current.scale * Math.exp(-delta * 0.002), anchor));
    }
    // React's delegated wheel events are passive; this local listener prevents page scroll.
    element.addEventListener("wheel", wheel, { passive: false });
    return () => element.removeEventListener("wheel", wheel);
  }, [fixedFraming]);

  return <div className="relative h-full min-h-0 w-full overflow-hidden bg-[#f9c486]">
    <svg ref={svg} viewBox="0 0 1672 941" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-label="Interactive circular Columbus map in the desert">
      <g ref={scene}>
      <image href="/world-desert-overhead-v1.png" width="1672" height="941" />
      <defs>
        <filter id={`${edgeId}-blur`} filterUnits="userSpaceOnUse" x="0" y="0" width="1672" height="941">
          <feGaussianBlur stdDeviation="12" />
        </filter>
        <mask id={edgeId} maskUnits="userSpaceOnUse" maskContentUnits="userSpaceOnUse" x="0" y="0" width="1672" height="941" style={{ maskType: "alpha" }}>
          <circle cx={CENTER.x} cy={CENTER.y} r={RADIUS - 12} fill="white" filter={`url(#${edgeId}-blur)`} />
        </mask>
      </defs>
      <g mask={`url(#${edgeId})`}>
        <circle cx={CENTER.x} cy={CENTER.y} r={RADIUS} fill="#f6f4ee" />
        <g transform={`translate(${CENTER.x + viewCamera.x} ${CENTER.y + viewCamera.y}) scale(${viewCamera.scale})`}>
          <image href="/maps/columbus-world.svg" x={-MAP_WIDTH / 2} y={-MAP_HEIGHT / 2} width={MAP_WIDTH} height={MAP_HEIGHT} />
          {buildingLayer && buildingsVisible && <g id={`${edgeId}-assets`} aria-label="World assets" pointerEvents="none">
            <BuildingLayer includeEstimates={includeEstimates} />
            <image href="/maps/columbus-building-labels-v1.svg" x={-MAP_WIDTH / 2} y={-MAP_HEIGHT / 2} width={MAP_WIDTH} height={MAP_HEIGHT} />
          </g>}
        </g>
      </g>
      {!fixedFraming && <circle cx={CENTER.x} cy={CENTER.y} r={RADIUS} fill="transparent" className="cursor-grab active:cursor-grabbing" style={{ touchAction: "none" }} onPointerDown={start} onPointerMove={move} onPointerUp={end} onPointerCancel={end} onLostPointerCapture={end} />}
      </g>
    </svg>
    {buildingLayer && <div role="group" aria-label="Building layer controls" className="absolute left-3 top-16 max-w-[calc(100%-1.5rem)] rounded-xl bg-[#02030f]/85 p-2 text-xs text-white backdrop-blur-xl">
      <div className="flex flex-wrap items-center gap-x-3">
        <button type="button" aria-label={buildingsVisible ? "Hide all assets — map only" : "Show building assets"} aria-pressed={buildingsVisible} aria-controls={`${edgeId}-assets`} onClick={() => setBuildingsVisible((visible) => !visible)} className="min-h-11 rounded-lg px-2 hover:bg-white/10">Buildings {buildingsVisible ? "on" : "off"}</button>
        <label className={`flex min-h-11 items-center gap-2 px-2 ${buildingsVisible ? "cursor-pointer" : "opacity-40"}`}><input type="checkbox" checked={includeEstimates} disabled={!buildingsVisible} onChange={(event) => setIncludeEstimates(event.target.checked)} className="accent-[#9daaf0]" />Include estimates</label>
      </div>
      <p aria-live="polite" className="px-2 pb-1 text-[10px] text-white/60">{!buildingsVisible ? "Map only · all assets hidden" : includeEstimates ? "Recorded heights · floor estimates · unknown: 6 m" : "Recorded heights only — estimates hidden"}</p>
    </div>}
    {!fixedFraming && <div role="group" aria-label="Map controls" className="absolute inset-x-3 bottom-[calc(6.5rem+env(safe-area-inset-bottom))] mx-auto flex w-fit max-w-[calc(100%-1.5rem)] items-center gap-1 rounded-xl bg-[#02030f]/85 p-1 text-white shadow-lg backdrop-blur-xl">
      <button type="button" aria-label="Zoom out" disabled={camera.scale <= MIN_SCALE} onClick={() => setCamera((current) => zoomCamera(current, current.scale / 1.25))} className="h-11 w-11 shrink-0 rounded-lg text-xl hover:bg-white/10 disabled:opacity-30">−</button>
      <input type="range" aria-label="Map scale" min={MIN_SCALE} max={MAX_SCALE} step="0.01" value={camera.scale} onChange={(event) => setCamera((current) => zoomCamera(current, Number(event.target.value)))} className="min-w-0 w-24 accent-[#9daaf0] sm:w-32" />
      <button type="button" aria-label="Zoom in" disabled={camera.scale >= MAX_SCALE} onClick={() => setCamera((current) => zoomCamera(current, current.scale * 1.25))} className="h-11 w-11 shrink-0 rounded-lg text-xl hover:bg-white/10 disabled:opacity-30">+</button>
      <button type="button" onClick={() => setCamera(INITIAL_CAMERA)} className="h-11 rounded-lg px-3 text-xs hover:bg-white/10">Reset</button>
    </div>}
    <div className="absolute inset-x-0 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] flex flex-wrap justify-center gap-x-2 bg-[#02030f]/85 px-3 py-2 text-[10px] text-white/75">
      {!fixedFraming && <span>Drag to pan · pinch or scroll to zoom</span>}
      <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer" className="underline">© OpenStreetMap contributors · ODbL</a>
    </div>
  </div>;
}
