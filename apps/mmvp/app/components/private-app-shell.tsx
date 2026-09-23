"use client";

import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { MinimapRail } from "./minimap-rail";
import { pageTransitionEvent, type PageTransitionDetail } from "./page-transition-events";

const privateRoutes = new Set(["/admin", "/stats", "/terminal", "/world-tree"]);

const pageVariants = {
  enter: (direction: number) => ({ x: direction ? `${direction * -100}%` : 0 }),
  center: { x: 0 },
  exit: (direction: number) => ({ x: direction ? `${direction * 100}%` : 0 }),
};

export function PrivateAppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [transition, setTransition] = useState<PageTransitionDetail | null>(null);

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
    <MotionConfig reducedMotion="user">
      <div className="grid min-h-dvh overflow-x-clip bg-black">
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
            {children}
          </motion.div>
        </AnimatePresence>
        <MinimapRail />
      </div>
    </MotionConfig>
  );
}
