"use client";

import { useEffect } from "react";

export function PwaRegistration() {
  useEffect(() => {
    // Do not cache development bundles or interfere with HMR.
    if (process.env.NODE_ENV !== "production" || !window.isSecureContext || !("serviceWorker" in navigator)) return;
    void navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" }).catch((error: unknown) => {
      console.error("Unable to register the mobile app's offline worker", error);
    });
  }, []);
  return null;
}
