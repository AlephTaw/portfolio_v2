"use client";

import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import { usePathname } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { ActivityWorkspaceProvider } from "./activity-workspace-context";
import { ArcStatusLine } from "./arc-status-line";
import { ComposerDockContext } from "./composer-dock-context";
import { ChatConversationProvider } from "./chat-conversations";
import { MinimapRail } from "./minimap-rail";
import { PageSwipeNavigation } from "./page-swipe-navigation";
import { pageTransitionEvent, type PageTransitionDetail } from "./page-transition-events";
import { PrivateComposer } from "./private-composer";
import { RightRailVisibilityProvider } from "./right-rail-visibility-context";
import { SplitViewProvider } from "./split-view-context";
import { SplitResizeHandle } from "./split-resize-handle";
import { SplitWorkspace } from "./split-workspace";
import { TerminalViewProvider } from "./terminal-view-context";
import { StatsViewProvider } from "../stats/components/stats-view-context";

const privateRoutes = new Set(["/admin", "/chat", "/stats", "/terminal", "/world"]);

const pageVariants = {
  enter: (direction: number) => ({ x: direction ? `${direction * -100}%` : 0 }),
  center: { x: 0 },
  exit: (direction: number) => ({ x: direction ? `${direction * 100}%` : 0 }),
};

export function PrivateAppShell({ children }: { children: ReactNode }) {
  return (
    <SplitViewProvider>
      <ActivityWorkspaceProvider>
        <TerminalViewProvider>
          <ChatConversationProvider>
          <StatsViewProvider>
            <PrivateAppShellContent>{children}</PrivateAppShellContent>
          </StatsViewProvider>
          </ChatConversationProvider>
        </TerminalViewProvider>
      </ActivityWorkspaceProvider>
    </SplitViewProvider>
  );
}

function PrivateAppShellContent({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [transition, setTransition] = useState<PageTransitionDetail | null>(null);
  const [rightRailHidden, setRightRailHidden] = useState(false);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [suggestionsRatio, setSuggestionsRatio] = useState(50);
  const [composerHeight, setComposerHeight] = useState(72);
  const [composerDock, setComposerDock] = useState<HTMLElement | null>(null);
  const workspaceRef = useRef<HTMLDivElement>(null);
  const revealRightRail = useCallback(() => setRightRailHidden(false), []);

  useEffect(() => {
    const prepareTransition = (event: Event) => {
      setTransition((event as CustomEvent<PageTransitionDetail>).detail);
    };
    window.addEventListener(pageTransitionEvent, prepareTransition);
    return () => window.removeEventListener(pageTransitionEvent, prepareTransition);
  }, []);

  if (!privateRoutes.has(pathname)) return children;

  const direction = transition?.to === pathname ? transition.direction : 0;
  const duration = direction === 0 ? 0 : 0.28;

  return (
    <ComposerDockContext.Provider value={composerDock}>
    <RightRailVisibilityProvider value={{ hidden: rightRailHidden, reveal: revealRightRail }}>
    <MotionConfig reducedMotion="user">
      <PageSwipeNavigation />
      <div
        className="relative flex h-dvh min-h-0 flex-col overflow-hidden bg-black"
        style={{
          "--composer-height": `${composerHeight}px`,
          "--composer-max-width": "72rem",
          "--composer-gutter": "clamp(1.5rem, 4.4vw, 3.5rem)",
          "--composer-edge-inset": "calc(max(0px, (100vw - var(--composer-max-width)) / 2) + var(--composer-gutter))",
          "--rail-edge-inset": "calc(var(--composer-edge-inset) - 1.5rem)",
        } as CSSProperties}
      >
        <ArcStatusLine />
        <div
          className="relative grid min-h-0 flex-1 overflow-hidden"
          ref={workspaceRef}
          style={{ gridTemplateRows: suggestionsOpen ? `${suggestionsRatio}fr ${100 - suggestionsRatio}fr` : "minmax(0, 1fr)" }}
        >
          <AnimatePresence custom={direction} initial={false} mode="sync">
            <motion.div
              animate="center"
              className="h-full min-h-0 w-full touch-pan-y overflow-hidden [grid-area:1/1]"
              data-page-swipe-surface
              custom={direction}
              exit="exit"
              initial="enter"
              key={pathname}
              transition={{ duration, ease: [0.4, 0, 0.2, 1] }}
              variants={pageVariants}
            >
              <SplitWorkspace>{children}</SplitWorkspace>
            </motion.div>
          </AnimatePresence>
          <section aria-label="Composer recommendations pane" className={`relative row-start-2 min-h-0 overflow-hidden bg-black pb-[calc(var(--composer-height)+0.5rem)] ${suggestionsOpen ? "" : "hidden"}`}><div className="h-full min-h-0" id="command-suggestions-pane" /></section>
          {suggestionsOpen && <SplitResizeHandle containerRef={workspaceRef} direction="horizontal" label="Resize system calls and suggested actions pane" onRatioChange={setSuggestionsRatio} ratio={suggestionsRatio} />}
        </div>
        <PrivateComposer onDockElementChange={setComposerDock} onHeightChange={setComposerHeight} onSuggestionsOpenChange={setSuggestionsOpen} />
        <Suspense fallback={null}>
          <MinimapRail />
        </Suspense>
      </div>
    </MotionConfig>
    </RightRailVisibilityProvider>
    </ComposerDockContext.Provider>
  );
}
