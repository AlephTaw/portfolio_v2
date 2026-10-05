import { ViewAnchor } from "./view-anchor";
import { useTimelineInteraction } from "../layouts/timeline-visibility";
import type { LogMarker } from "../history/activity-log";
import { SettingsButton } from "./settings-button";

export function TimelineRail({ visible, splitOffset, markers, minimizedCount, onResize, onMinimize, historyVisible = true, settingsActive, onToggleSettings }: { visible: boolean; splitOffset: number | null; markers: LogMarker[]; minimizedCount: number; onResize: (delta: number) => void; onMinimize: () => void; historyVisible?: boolean; settingsActive: boolean; onToggleSettings: () => void }) {
  const interaction = useTimelineInteraction();
  // The first column of the centered primary layout, outside scrolling panes.
  // Navigation anchors will live here as the timeline interaction is designed.
  // Mobile: stop 8px above the 60px dock, including its bottom safe area.
  return <aside aria-label="Activity timeline" aria-hidden={!visible} inert={!visible} className="activity-timeline pointer-events-none relative z-30 h-[calc(100%-68px-env(safe-area-inset-bottom))] w-px bg-[var(--timeline-gold)] sm:h-full">
    <span aria-hidden="true" {...interaction} className="pointer-events-auto absolute inset-y-0 -left-3 w-6 touch-pan-y" />
    {historyVisible && <>
      <span aria-hidden="true" className="absolute left-1/2 top-4 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--timeline-gold)]" />
      <span aria-label={`${minimizedCount} minimized views`} className="absolute left-2 top-4 -translate-y-1/2 rounded bg-black/70 px-1 text-[10px] leading-4 text-[var(--timeline-gold)]">{minimizedCount}</span>
      {markers.map((marker) => <span key={marker.id} aria-hidden="true" className="absolute left-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--timeline-gold)]" style={{ top: marker.offset }} />)}
    </>}
    {splitOffset !== null && <ViewAnchor offset={splitOffset} onResize={onResize} onMinimize={onMinimize} />}
    <SettingsButton timeline hidden={!visible} active={settingsActive} onClick={onToggleSettings} className="timeline-settings-button absolute left-1/2 -translate-x-1/2" />
  </aside>;
}
