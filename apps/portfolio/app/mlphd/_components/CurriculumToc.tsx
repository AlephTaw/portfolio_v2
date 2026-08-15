"use client";

import { useMemo, useState } from "react";
import type { CurriculumUnit, CurriculumView } from "../../lib/curriculum";
import { CurriculumBranch } from "./CurriculumBranch";

const VIEW_LEVELS = [
  { label: "Domains", level: 1 },
  { label: "Subjects", level: 2 },
  { label: "Units", level: 3 },
] as const;

type CurriculumTocProps = {
  activeUnitId: string;
  onIntent: (unitId: string) => void;
  onSelect: (unitId: string) => void;
  unitsById: Map<string, CurriculumUnit>;
  view: CurriculumView;
};

export function CurriculumToc({
  activeUnitId,
  onIntent,
  onSelect,
  unitsById,
  view,
}: CurriculumTocProps) {
  const sectionIds = useMemo(
    () =>
      view.flattened
        .filter((item) => item.type === "section")
        .map((item) => item.id),
    [view.flattened],
  );
  const [viewLevel, setViewLevel] = useState(3);
  const [openSections, setOpenSections] = useState(() => new Set(sectionIds));
  const viewLabel = VIEW_LEVELS.find((option) => option.level === viewLevel)?.label;

  function cycleViewLevel() {
    const nextLevel = viewLevel === VIEW_LEVELS.length ? 1 : viewLevel + 1;
    setViewLevel(nextLevel);
    setOpenSections(new Set(sectionIds));
  }

  return (
    <aside className="lg:sticky lg:top-8 lg:h-[calc(100vh-4rem)]">
      <div className="bg-background p-5">
        <div className="flex items-center justify-between gap-4">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#766b5d]">
            Contents
          </p>
          <button
            aria-label={`Change contents view depth. Currently showing ${viewLabel}.`}
            className="shrink-0 text-xs font-medium text-[#766b5d] underline decoration-[#c8b8a0] underline-offset-4 transition-colors hover:text-[#191714]"
            onClick={cycleViewLevel}
            type="button"
          >
            View: {viewLabel}
          </button>
        </div>

        <nav
          aria-label="Curriculum table of contents"
          className="pane-scroll mt-5 max-h-[52vh] space-y-1 overflow-y-auto pr-2 lg:max-h-[calc(100vh-10rem)]"
        >
          {[...view.items]
            .sort((a, b) => a.order - b.order)
            .map((item) => (
              <CurriculumBranch
                activeUnitId={activeUnitId}
                depth={1}
                item={item}
                key={item.type === "unit" ? item.unit : item.id}
                maxDepth={viewLevel}
                onIntent={onIntent}
                onSelect={onSelect}
                openSections={openSections}
                setOpenSections={setOpenSections}
                unitsById={unitsById}
              />
            ))}
        </nav>
      </div>
    </aside>
  );
}
