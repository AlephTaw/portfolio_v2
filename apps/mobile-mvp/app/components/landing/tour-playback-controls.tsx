"use client";

export function TourPlaybackControls({ paused, speed, onTogglePause, onSeek, onSpeedChange, canRewind, canForward }: {
  paused: boolean; speed: number; onTogglePause: () => void;
  onSeek: (direction: -1 | 1) => void; onSpeedChange: (speed: number) => void;
  canRewind: boolean; canForward: boolean;
}) {
  const button = "grid h-11 w-11 shrink-0 place-items-center rounded-full text-white/80 hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-white/70 disabled:opacity-30 disabled:hover:bg-transparent";
  return <div role="group" aria-label="Animation playback" className="pointer-events-auto absolute bottom-[max(1rem,env(safe-area-inset-bottom))] left-[max(1rem,env(safe-area-inset-left))] z-20 flex items-center rounded-full border border-white/20 bg-black/80 p-1 backdrop-blur-sm">
    <button type="button" title="Rewind one frame" aria-label="Rewind one frame" disabled={!canRewind} onClick={() => onSeek(-1)} className={button}><SeekIcon reverse /></button>
    <button type="button" title={paused ? "Resume" : "Pause"} aria-label={paused ? "Resume" : "Pause"} aria-pressed={paused} onClick={onTogglePause} className={button}>
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">{paused ? <path d="m7 4 14 8-14 8Z" /> : <path d="M6 4h4v16H6zm8 0h4v16h-4z" />}</svg>
    </button>
    <button type="button" title="Fast-forward one frame" aria-label="Fast-forward one frame" disabled={!canForward} onClick={() => onSeek(1)} className={button}><SeekIcon /></button>
    <span aria-hidden="true" className="mx-1 h-5 w-px bg-white/20" />
    <button type="button" title="Slow down" aria-label="Slow down" disabled={speed <= 1} onClick={() => onSpeedChange(speed - 1)} className={button}><span aria-hidden="true" className="text-xl">−</span></button>
    <select aria-label="Playback speed" title="1× is the original speed" value={speed} onChange={(event) => onSpeedChange(Number(event.target.value))} className="h-11 w-14 rounded-lg bg-transparent text-center text-xs text-white [color-scheme:dark] focus-visible:outline focus-visible:outline-white/70">
      {[1, 2, 3, 4, 5, 6].map((value) => <option key={value} value={value}>{value}×</option>)}
    </select>
    <button type="button" title="Speed up" aria-label="Speed up" disabled={speed >= 6} onClick={() => onSpeedChange(speed + 1)} className={button}><span aria-hidden="true" className="text-xl">+</span></button>
  </div>;
}

function SeekIcon({ reverse = false }: { reverse?: boolean }) {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className={`h-4 w-4 ${reverse ? "rotate-180" : ""}`} fill="currentColor"><path d="m3 5 9 7-9 7zm9 0 9 7-9 7z" /></svg>;
}
