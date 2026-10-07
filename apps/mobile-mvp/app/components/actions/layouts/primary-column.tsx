"use client";

import { useRef, type ReactNode } from "react";
import { TimelineInteractionContext, TimelineVisibilityContext, TimelineRevealTarget, useTimelineVisibility } from "./timeline-visibility";
import { useTimelineSwipe } from "./use-timeline-swipe";
import { TimelineRail } from "../navigation/timeline-rail";
import { SecondaryColumn } from "./secondary-column";
import type { LogMarker } from "../history/activity-log";

export function PrimaryColumn({ content, navigation, splitOffset = null, timelineStart = 0, alignTopAnchor = false, markers, minimizedCount, onResize, onMinimize, historyVisible = true, settingsActive, onToggleSettings }: { content: ReactNode; navigation: ReactNode; splitOffset?: number | null; timelineStart?: number; alignTopAnchor?: boolean; markers: LogMarker[]; minimizedCount: number; onResize: (delta: number) => void; onMinimize: () => void; historyVisible?: boolean; settingsActive: boolean; onToggleSettings: () => void }) {
  const { visible, interact, reveal, conceal } = useTimelineVisibility();
  const root = useRef<HTMLDivElement>(null);
  useTimelineSwipe(root, reveal, conceal, visible);
  return <TimelineInteractionContext.Provider value={interact}><TimelineVisibilityContext.Provider value={visible}><div ref={root} data-timeline-visible={visible} className="actions-primary-column relative mx-auto grid h-full min-h-0 w-[calc(100%-1rem)] max-w-[629.8px] grid-rows-[minmax(0,1fr)]">
    <TimelineRevealTarget />
    <TimelineRail startOffset={timelineStart} alignTopAnchor={alignTopAnchor} settingsActive={settingsActive} onToggleSettings={onToggleSettings} historyVisible={historyVisible} visible={visible} splitOffset={splitOffset} markers={markers} minimizedCount={minimizedCount} onResize={onResize} onMinimize={onMinimize} />
    <SecondaryColumn content={content} navigation={navigation} />
  </div></TimelineVisibilityContext.Provider></TimelineInteractionContext.Provider>;
}
