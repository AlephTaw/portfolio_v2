"use client";

import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import { usePathname } from "next/navigation";
import { Suspense, useCallback, useEffect, useState, type ReactNode } from "react";
import { ActivityWorkspaceProvider } from "./activity-workspace-context";
import { MinimapRail } from "./minimap-rail";
import { pageTransitionEvent, type PageTransitionDetail } from "./page-transition-events";
import { PrivateComposer } from "./private-composer";
import { RightRailVisibilityProvider } from "./right-rail-visibility-context";
import { SplitViewProvider } from "./split-view-context";
import { SplitWorkspace } from "./split-workspace";

const privateRoutes = new Set(["/admin", "/stats", "/terminal", "/world"]);
const interactiveSelector = [
  "a", "button", "input", "textarea", "select", "summary", "label",
  "[contenteditable]:not([contenteditable='false'])",
  "[role='button']", "[role='link']", "[role='tab']", "[role='switch']",
  "[role='checkbox']", "[role='radio']", "[role='menuitem']", "[role='dialog']",
  "[data-rail-gesture-ignore]", ".cursor-pointer",
].join(",");

const pageVariants = {
  enter: (direction: number) => ({ x: direction ? `${direction * -100}%` : 0 }),
  center: { x: 0 },
  exit: (direction: number) => ({ x: direction ? `${direction * 100}%` : 0 }),
};

export function PrivateAppShell({ children }: { children: ReactNode }) {
  return (
    <SplitViewProvider>
      <ActivityWorkspaceProvider>
        <PrivateAppShellContent>{children}</PrivateAppShellContent>
      </ActivityWorkspaceProvider>
    </SplitViewProvider>
  );
}

function PrivateAppShellContent({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [transition, setTransition] = useState<PageTransitionDetail | null>(null);
  const [rightRailHidden, setRightRailHidden] = useState(false);
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
  const toggleRailOnEmptyDoubleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.defaultPrevented || !(event.target instanceof Element)) return;
    if (event.target.closest(interactiveSelector)) return;
    setRightRailHidden((hidden) => !hidden);
  };

  return (
    <RightRailVisibilityProvider value={{ hidden: rightRailHidden, reveal: revealRightRail }}>
    <MotionConfig reducedMotion="user">
      <div className="grid min-h-dvh overflow-x-clip bg-black" onDoubleClick={toggleRailOnEmptyDoubleClick}>
        <AnimatePresence custom={direction} initial={false} mode="sync">
          <motion.div
            animate="center"
            className="min-h-dvh w-full [grid-area:1/1]"
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
        <PrivateComposer />
        <Suspense fallback={null}>
          <MinimapRail />
        </Suspense>
      </div>
    </MotionConfig>
    </RightRailVisibilityProvider>
  );
}
