"use client";

import { ReactLenis, useLenis } from "lenis/dist/lenis-react";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect } from "react";

function DevResizeObserverGuard() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") {
      return;
    }

    const isResizeObserverNoise = (message: string) =>
      message.includes("ResizeObserver loop completed with undelivered notifications") ||
      message.includes("ResizeObserver loop limit exceeded");

    const handleError = (event: ErrorEvent) => {
      if (!isResizeObserverNoise(event.message)) {
        return;
      }

      event.preventDefault();
      event.stopImmediatePropagation();
    };

    window.addEventListener("error", handleError);
    return () => {
      window.removeEventListener("error", handleError);
    };
  }, []);

  return null;
}

function LenisRouteSync() {
  const pathname = usePathname();
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) {
      return;
    }

    let frame = window.requestAnimationFrame(() => {
      frame = window.requestAnimationFrame(() => {
        lenis.resize();
      });
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [lenis, pathname]);

  useEffect(() => {
    if (!lenis) {
      return;
    }

    let frame = 0;

    const handleResize = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        lenis.resize();
      });
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      window.cancelAnimationFrame(frame);
    };
  }, [lenis]);

  return null;
}

export function SmoothScroll({ children }: { children: ReactNode }) {
  return (
    <ReactLenis
      root
      options={{
        autoResize: false,
        lerp: 0.08,
        duration: 1.15,
        smoothWheel: true,
        stopInertiaOnNavigate: true,
      }}
    >
      <DevResizeObserverGuard />
      <LenisRouteSync />
      {children}
    </ReactLenis>
  );
}
