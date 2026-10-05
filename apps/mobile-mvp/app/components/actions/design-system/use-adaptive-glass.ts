"use client";

import { useEffect, type RefObject } from "react";
import { glassTintOpacity, relativeLuminance, type GlassTintConfig } from "./glass-tint";

// Sample our own local background asset, never the screen or user-uploaded media.
// Measurements are batched outside ResizeObserver callbacks to avoid layout loops.
export function useAdaptiveGlass(root: RefObject<HTMLElement | null>, planetVisible: boolean, theme: "dark" | "light", config: GlassTintConfig) {
  useEffect(() => {
    const page = root.current;
    if (!page) return;
    page.style.setProperty("--glass-blur", `${Math.min(80, Math.max(0, config.blur))}px`);
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 32;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    const image = new Image();
    let ready = false;
    let failed = false;
    let frame = 0;
    const observed = new Set<HTMLElement>();
    const measure = () => {
      const backdrop = page.querySelector<HTMLElement>(".actions-desert-background")?.getBoundingClientRect();
      page.querySelectorAll<HTMLElement>(".activity-overlay-surface.liquid-glass-surface").forEach((surface) => {
        if (!observed.has(surface)) { observer.observe(surface); observed.add(surface); }
        const bounds = surface.getBoundingClientRect();
        const top = Math.max(0, bounds.top), bottom = Math.min(innerHeight, bounds.bottom);
        const left = Math.max(0, bounds.left), right = Math.min(innerWidth, bounds.right);
        if (bottom <= top || right <= left) return;
        let luminance = 0; // Closed-visor gradient stays below the dark tint threshold.
        if (planetVisible && ready && context && backdrop) {
          const scale = Math.max(backdrop.width / image.naturalWidth, backdrop.height / image.naturalHeight);
          const width = image.naturalWidth * scale, height = image.naturalHeight * scale;
          const imageLeft = backdrop.left + (backdrop.width - width) / 2;
          const imageTop = backdrop.top + (backdrop.height - height) / 2;
          context.fillStyle = "#000";
          context.fillRect(0, 0, 32, 32);
          context.drawImage(image, (imageLeft - left) / (right - left) * 32, (imageTop - top) / (bottom - top) * 32, width / (right - left) * 32, height / (bottom - top) * 32);
          const pixels = context.getImageData(0, 0, 32, 32).data;
          let sum = 0;
          for (let index = 0; index < pixels.length; index += 4) sum += relativeLuminance(pixels[index], pixels[index + 1], pixels[index + 2]);
          luminance = sum / (32 * 32);
        }
        // Neutral fallback protects text while the image loads or if sampling is unavailable.
        const opacity = planetVisible && (!ready || failed || !context)
          ? config.enabled ? config.strength * 0.65 : 0
          : glassTintOpacity(luminance, config, theme);
        surface.style.setProperty("--adaptive-glass-alpha", opacity.toFixed(3));
      });
      for (const surface of observed) if (!page.contains(surface)) { observer.unobserve(surface); observed.delete(surface); }
    };
    const schedule = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(measure); };
    const observer = new ResizeObserver(schedule);
    observer.observe(page);
    const background = page.querySelector<HTMLElement>(".actions-desert-background");
    if (background) observer.observe(background);
    const mutations = new MutationObserver(schedule);
    mutations.observe(page, { childList: true, subtree: true });
    image.onload = () => { ready = true; schedule(); };
    image.onerror = () => { failed = true; schedule(); };
    image.src = "/landing-desert-planet-v3.png";
    page.addEventListener("scroll", schedule, true);
    window.addEventListener("resize", schedule);
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect(); mutations.disconnect();
      page.removeEventListener("scroll", schedule, true);
      window.removeEventListener("resize", schedule);
      image.onload = image.onerror = null;
    };
  }, [root, planetVisible, theme, config]);
}
