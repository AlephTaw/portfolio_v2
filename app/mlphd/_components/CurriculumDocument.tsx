"use client";

import { useEffect, useMemo, useRef } from "react";
import type { CurriculumUnit } from "../../lib/curriculum";
import { MarimoIslandsRuntime } from "./MarimoIslandsRuntime";

export type StaticBlock =
  | { id: string; kind: "static"; html: string }
  | { id: string; kind: "interactive"; placeholder: boolean };

export type StaticDocument = {
  schemaVersion: 1;
  units: Array<{ id: string; blocks: StaticBlock[] }>;
};

export type InteractiveBlock = {
  id: string;
  html: string;
  visible: boolean;
};

export type InteractiveLayer = {
  schemaVersion: 1;
  id: string;
  title: string;
  units: Array<{ id: string; blocks: InteractiveBlock[] }>;
};

export type InteractiveLayerDescriptor = {
  id: string;
  title: string;
  order: number;
  unitIds: string[];
  url: string;
};

export type IslandsManifest = {
  schemaVersion: 1;
  runtime: {
    script: string;
    payloadUrl: string;
  };
  layers: InteractiveLayerDescriptor[];
};

type CurriculumDocumentProps = {
  interactiveLayers: ReadonlyMap<string, InteractiveLayer>;
  layerErrors: ReadonlySet<string>;
  manifest: IslandsManifest;
  onLayerNear: (layerId: string) => void;
  onRetryLayer: (layerId: string) => void;
  runtimePayloadHtml: string | null;
  staticDocument: StaticDocument;
  unitsById: Map<string, CurriculumUnit>;
};

export function CurriculumDocument({
  interactiveLayers,
  layerErrors,
  manifest,
  onLayerNear,
  onRetryLayer,
  runtimePayloadHtml,
  staticDocument,
  unitsById,
}: CurriculumDocumentProps) {
  const documentRef = useRef<HTMLDivElement>(null);
  const staticUnitsById = useMemo(
    () => new Map(staticDocument.units.map((unit) => [unit.id, unit])),
    [staticDocument.units],
  );
  const interactiveRevision = [...interactiveLayers.keys()].join(":");

  useEffect(() => {
    const existing = document.getElementById("mlphd-marimo-islands-style");
    if (existing) return;
    const stylesheet = document.createElement("link");
    stylesheet.id = "mlphd-marimo-islands-style";
    stylesheet.href = "/vendor/marimo-islands/style.css";
    stylesheet.rel = "stylesheet";
    document.head.append(stylesheet);
    return () => stylesheet.remove();
  }, []);

  useEffect(() => {
    const layerElements = documentRef.current?.querySelectorAll<HTMLElement>(
      "[data-interactive-layer]",
    );
    if (!layerElements) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const layerId = entry.target.getAttribute("data-interactive-layer");
          if (layerId) onLayerNear(layerId);
        }
      },
      { rootMargin: "150% 0px 150% 0px", threshold: 0 },
    );
    layerElements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [onLayerNear]);

  return (
    <div className="mlphd-islands min-w-0 bg-background" ref={documentRef}>
      {runtimePayloadHtml ? (
        <div
          aria-hidden="true"
          className="hidden"
          dangerouslySetInnerHTML={{ __html: runtimePayloadHtml }}
          suppressHydrationWarning
        />
      ) : null}
      <MarimoIslandsRuntime
        active={runtimePayloadHtml !== null}
        revision={interactiveRevision}
        src={manifest.runtime.script}
      />

      {manifest.layers.map((descriptor) => {
        const interactiveLayer = interactiveLayers.get(descriptor.id);
        const interactiveUnitsById = new Map(
          interactiveLayer?.units.map((unit) => [unit.id, unit]) ?? [],
        );

        return (
          <div
            data-interactive-layer={descriptor.id}
            id={`subject-${descriptor.id}`}
            key={descriptor.id}
          >
            {descriptor.unitIds.map((unitId) => {
              const unit = unitsById.get(unitId);
              const staticUnit = staticUnitsById.get(unitId);
              if (!unit || !staticUnit) return null;
              const interactiveBlocks = new Map(
                interactiveUnitsById.get(unitId)?.blocks.map((block) => [block.id, block]) ?? [],
              );

              return (
                <section
                  aria-label={unit.title}
                  className="mlphd-unit scroll-mt-8 first:pt-0"
                  data-curriculum-unit={unit.id}
                  id={`unit-${unit.id}`}
                  key={unit.id}
                >
                  {staticUnit.blocks.map((block) => {
                    if (block.kind === "static") {
                      return (
                        <div
                          dangerouslySetInnerHTML={{ __html: block.html }}
                          key={block.id}
                          suppressHydrationWarning
                        />
                      );
                    }

                    const interactiveBlock = interactiveBlocks.get(block.id);
                    if (interactiveBlock) {
                      return (
                        <div
                          aria-hidden={interactiveBlock.visible ? undefined : true}
                          className={interactiveBlock.visible ? undefined : "hidden"}
                          data-interactive-block={block.id}
                          dangerouslySetInnerHTML={{ __html: interactiveBlock.html }}
                          key={block.id}
                          suppressHydrationWarning
                        />
                      );
                    }

                    if (!block.placeholder) return <div key={block.id} />;
                    return (
                      <div
                        aria-label={`${unit.title} interactive content`}
                        className="mlphd-interactive-placeholder"
                        key={block.id}
                      >
                        {layerErrors.has(descriptor.id) ? (
                          <button
                            className="underline underline-offset-4"
                            onClick={() => onRetryLayer(descriptor.id)}
                            type="button"
                          >
                            Load interactive content
                          </button>
                        ) : (
                          <span>Interactive content loads as you approach.</span>
                        )}
                      </div>
                    );
                  })}
                </section>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
