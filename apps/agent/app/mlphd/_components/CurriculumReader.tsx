"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CurriculumCatalog } from "../../lib/curriculum";
import islandsManifestData from "../../generated/mlphd-islands-manifest.json";
import staticDocumentData from "../../generated/mlphd-static-document.json";
import {
  CurriculumDocument,
  type InteractiveLayer,
  type IslandsManifest,
  type StaticDocument,
} from "./CurriculumDocument";
import { CurriculumToc } from "./CurriculumToc";

type RuntimePayload = {
  schemaVersion: 1;
  html: string;
};

type NavigationAnchor = {
  expiresAt: number;
  top: number;
  unitId: string;
};

const layerRequests = new Map<string, Promise<InteractiveLayer>>();
let runtimeRequest: Promise<RuntimePayload> | null = null;

function requestLayer(url: string): Promise<InteractiveLayer> {
  const existing = layerRequests.get(url);
  if (existing) return existing;
  const request = fetch(url).then(async (response) => {
    if (!response.ok) throw new Error(`Interactive layer request failed with ${response.status}`);
    return (await response.json()) as InteractiveLayer;
  });
  layerRequests.set(url, request);
  request.catch(() => layerRequests.delete(url));
  return request;
}

function requestRuntime(url: string): Promise<RuntimePayload> {
  if (runtimeRequest) return runtimeRequest;
  runtimeRequest = fetch(url).then(async (response) => {
    if (!response.ok) throw new Error(`Interactive runtime request failed with ${response.status}`);
    return (await response.json()) as RuntimePayload;
  });
  runtimeRequest.catch(() => {
    runtimeRequest = null;
  });
  return runtimeRequest;
}

function unitIdFromHash(unitsById: ReadonlyMap<string, unknown>): string | null {
  const unitId = window.location.hash.replace(/^#unit-/, "");
  return unitsById.has(unitId) ? unitId : null;
}

function scheduleIdle(callback: () => void, timeout = 800): () => void {
  if (typeof window.requestIdleCallback === "function") {
    const handle = window.requestIdleCallback(callback, { timeout });
    return () => window.cancelIdleCallback(handle);
  }
  const handle = window.setTimeout(callback, 0);
  return () => window.clearTimeout(handle);
}

export function CurriculumReader({ catalog }: { catalog: CurriculumCatalog }) {
  const manifest = islandsManifestData as IslandsManifest;
  const staticDocument = staticDocumentData as StaticDocument;
  const unitsById = useMemo(
    () => new Map(catalog.units.map((unit) => [unit.id, unit])),
    [catalog.units],
  );
  const layersByUnitId = useMemo(
    () =>
      new Map(
        manifest.layers.flatMap((layer) =>
          layer.unitIds.map((unitId) => [unitId, layer] as const),
        ),
      ),
    [manifest.layers],
  );
  const [activeUnitId, setActiveUnitId] = useState(
    manifest.layers[0]?.unitIds[0] ?? "",
  );
  const [interactiveLayers, setInteractiveLayers] = useState(
    () => new Map<string, InteractiveLayer>(),
  );
  const [layerErrors, setLayerErrors] = useState(() => new Set<string>());
  const [runtimePayloadHtml, setRuntimePayloadHtml] = useState<string | null>(null);
  const mountedRef = useRef(true);
  const navigationAnchorRef = useRef<NavigationAnchor | null>(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const documentElement = document.querySelector<HTMLElement>(".mlphd-islands");
    if (!documentElement) return;
    let adjustmentFrame = 0;
    const preserveAnchor = () => {
      cancelAnimationFrame(adjustmentFrame);
      adjustmentFrame = requestAnimationFrame(() => {
        const anchor = navigationAnchorRef.current;
        if (!anchor || performance.now() > anchor.expiresAt) {
          navigationAnchorRef.current = null;
          return;
        }
        const target = document.getElementById(`unit-${anchor.unitId}`);
        if (!target) return;
        const delta = target.getBoundingClientRect().top - anchor.top;
        if (Math.abs(delta) < 0.5) return;
        const root = document.documentElement;
        const previousScrollBehavior = root.style.scrollBehavior;
        root.style.scrollBehavior = "auto";
        window.scrollBy(0, delta);
        root.style.scrollBehavior = previousScrollBehavior;
      });
    };
    const observer = new ResizeObserver(preserveAnchor);
    observer.observe(documentElement);
    const releaseAnchor = () => {
      navigationAnchorRef.current = null;
    };
    const releaseKeys = new Set([
      "ArrowDown",
      "ArrowUp",
      "End",
      "Home",
      "PageDown",
      "PageUp",
      " ",
    ]);
    const releaseAnchorOnKey = (event: KeyboardEvent) => {
      if (releaseKeys.has(event.key)) releaseAnchor();
    };
    window.addEventListener("keydown", releaseAnchorOnKey, { passive: true });
    window.addEventListener("pointerdown", releaseAnchor, { passive: true });
    window.addEventListener("touchstart", releaseAnchor, { passive: true });
    window.addEventListener("wheel", releaseAnchor, { passive: true });
    return () => {
      cancelAnimationFrame(adjustmentFrame);
      observer.disconnect();
      window.removeEventListener("keydown", releaseAnchorOnKey);
      window.removeEventListener("pointerdown", releaseAnchor);
      window.removeEventListener("touchstart", releaseAnchor);
      window.removeEventListener("wheel", releaseAnchor);
    };
  }, []);

  const prefetchLayer = useCallback(
    (layerId: string) => {
      const descriptor = manifest.layers.find((layer) => layer.id === layerId);
      return descriptor ? requestLayer(descriptor.url) : Promise.resolve(null);
    },
    [manifest.layers],
  );

  const mountLayer = useCallback(
    async (layerId: string) => {
      if (interactiveLayers.has(layerId)) return interactiveLayers.get(layerId) ?? null;
      const descriptor = manifest.layers.find((layer) => layer.id === layerId);
      if (!descriptor) return null;
      try {
        const layer = await requestLayer(descriptor.url);
        if (layer.id !== descriptor.id) throw new Error("Interactive layer identity mismatch");
        if (!mountedRef.current) return layer;
        setInteractiveLayers((current) => {
          if (current.has(layer.id)) return current;
          const next = new Map(current);
          next.set(layer.id, layer);
          return next;
        });
        setLayerErrors((current) => {
          if (!current.has(layer.id)) return current;
          const next = new Set(current);
          next.delete(layer.id);
          return next;
        });
        return layer;
      } catch (error) {
        console.error(`Could not load interactive layer ${layerId}.`, error);
        if (mountedRef.current) {
          setLayerErrors((current) => new Set(current).add(layerId));
        }
        return null;
      }
    },
    [interactiveLayers, manifest.layers],
  );

  const warmRuntime = useCallback(async () => {
    if (runtimePayloadHtml) return;
    try {
      const payload = await requestRuntime(manifest.runtime.payloadUrl);
      if (mountedRef.current) setRuntimePayloadHtml(payload.html);
    } catch (error) {
      console.error("Could not warm the shared interactive runtime.", error);
    }
  }, [manifest.runtime.payloadUrl, runtimePayloadHtml]);

  const navigateToUnit = useCallback(
    (unitId: string, historyMode: "push" | "replace" | "none") => {
      const layer = layersByUnitId.get(unitId);
      const section = document.getElementById(`unit-${unitId}`);
      if (!layer || !section) return;

      const startedAt = performance.now();
      const anchorTop = 32;
      setActiveUnitId(unitId);
      if (historyMode === "push") {
        window.history.pushState(null, "", `#unit-${unitId}`);
      } else if (historyMode === "replace") {
        window.history.replaceState(null, "", `#unit-${unitId}`);
      }

      const root = document.documentElement;
      const previousScrollBehavior = root.style.scrollBehavior;
      root.style.scrollBehavior = "auto";
      window.scrollTo(0, window.scrollY + section.getBoundingClientRect().top - anchorTop);
      navigationAnchorRef.current = {
        expiresAt: startedAt + 15_000,
        top: anchorTop,
        unitId,
      };
      requestAnimationFrame(() => {
        const paintMilliseconds = performance.now() - startedAt;
        root.dataset.mlphdTocPaintMs = paintMilliseconds.toFixed(1);
        root.style.scrollBehavior = previousScrollBehavior;
        window.dispatchEvent(
          new CustomEvent("mlphd:navigation-paint", {
            detail: { unitId, paintMilliseconds },
          }),
        );
      });

      void mountLayer(layer.id);
      void warmRuntime();
    },
    [layersByUnitId, mountLayer, warmRuntime],
  );

  useEffect(() => {
    const initialUnitId = unitIdFromHash(unitsById) ?? activeUnitId;
    const initialFrame = requestAnimationFrame(() => {
      navigateToUnit(initialUnitId, "replace");
    });
    const restoreLocation = () => {
      const unitId = unitIdFromHash(unitsById);
      if (unitId) navigateToUnit(unitId, "none");
    };
    window.addEventListener("popstate", restoreLocation);
    return () => {
      cancelAnimationFrame(initialFrame);
      window.removeEventListener("popstate", restoreLocation);
    };
    // Initial navigation should run once; later navigation is cursor-driven.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const cancelWarmup = scheduleIdle(() => {
      void warmRuntime().then(() => {
        for (const layer of manifest.layers) void prefetchLayer(layer.id);
      });
    }, 1200);
    return cancelWarmup;
  }, [manifest.layers, prefetchLayer, warmRuntime]);

  useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>(
      ".mlphd-unit[data-curriculum-unit]",
    );
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        const unitId = visible[0]?.target.getAttribute("data-curriculum-unit");
        if (!unitId) return;
        setActiveUnitId(unitId);
        window.history.replaceState(null, "", `#unit-${unitId}`);
      },
      { rootMargin: "-12% 0px -70% 0px", threshold: 0 },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  const handleLayerNear = useCallback(
    (layerId: string) => {
      void mountLayer(layerId);
      void warmRuntime();
    },
    [mountLayer, warmRuntime],
  );

  const retryLayer = useCallback(
    (layerId: string) => {
      const descriptor = manifest.layers.find((layer) => layer.id === layerId);
      if (descriptor) layerRequests.delete(descriptor.url);
      setLayerErrors((current) => {
        const next = new Set(current);
        next.delete(layerId);
        return next;
      });
      void mountLayer(layerId);
      void warmRuntime();
    },
    [manifest.layers, mountLayer, warmRuntime],
  );

  const indicateUnitIntent = useCallback(
    (unitId: string) => {
      const layer = layersByUnitId.get(unitId);
      if (layer) void prefetchLayer(layer.id);
    },
    [layersByUnitId, prefetchLayer],
  );

  if (!unitsById.has(activeUnitId)) return null;

  return (
    <section className="grid gap-10 lg:grid-cols-[minmax(14rem,16rem)_minmax(0,1fr)] lg:items-start">
      <CurriculumToc
        activeUnitId={activeUnitId}
        onIntent={indicateUnitIntent}
        onSelect={(unitId) => navigateToUnit(unitId, "push")}
        unitsById={unitsById}
        view={catalog.views.default}
      />
      <CurriculumDocument
        interactiveLayers={interactiveLayers}
        layerErrors={layerErrors}
        manifest={manifest}
        onLayerNear={handleLayerNear}
        onRetryLayer={retryLayer}
        runtimePayloadHtml={runtimePayloadHtml}
        staticDocument={staticDocument}
        unitsById={unitsById}
      />
    </section>
  );
}
