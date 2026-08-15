"use client";

import { useEffect } from "react";

type MarimoRuntimeModule = {
  initialize?: () => Promise<void>;
};

export function MarimoIslandsRuntime({
  active,
  revision,
  src,
}: {
  active: boolean;
  revision: string;
  src: string;
}) {
  useEffect(() => {
    if (!active) return;
    let cancelled = false;

    import(/* @vite-ignore */ src)
      .then(async (runtime: MarimoRuntimeModule) => {
        if (!cancelled) await runtime.initialize?.();
      })
      .catch((error: unknown) => {
        console.error("Marimo interactive layer failed to initialize.", error);
      });

    return () => {
      cancelled = true;
    };
  }, [active, revision, src]);

  return null;
}
