"use client";

import type { Dispatch, SetStateAction } from "react";
import { FiChevronDown, FiChevronRight } from "react-icons/fi";
import type {
  CurriculumUnit,
  CurriculumViewItem,
} from "../../lib/curriculum";

type CurriculumBranchProps = {
  activeUnitId: string;
  depth: number;
  item: CurriculumViewItem;
  maxDepth: number;
  onSelect: (unitId: string) => void;
  openSections: Set<string>;
  setOpenSections: Dispatch<SetStateAction<Set<string>>>;
  unitsById: Map<string, CurriculumUnit>;
};

export function CurriculumBranch({
  activeUnitId,
  depth,
  item,
  maxDepth,
  onSelect,
  openSections,
  setOpenSections,
  unitsById,
}: CurriculumBranchProps) {
  if (depth > maxDepth) return null;

  const inset = `${Math.max(depth - 1, 0) * 0.75}rem`;

  if (item.type === "unit") {
    const unit = unitsById.get(item.unit);
    if (!unit) return null;

    return (
      <button
        aria-current={activeUnitId === unit.id ? "page" : undefined}
        className={`flex w-full items-start border-l py-1 pl-6 text-left text-sm leading-6 transition-colors ${
          activeUnitId === unit.id
            ? "border-black text-[#191714]"
            : "border-[#d8d0c1] text-[#766b5d] hover:border-[#766b5d] hover:text-[#191714]"
        }`}
        onClick={() => onSelect(unit.id)}
        style={{ marginLeft: inset }}
        type="button"
      >
        <span className="min-w-0 flex-1">{unit.title}</span>
      </button>
    );
  }

  const isOpen = openSections.has(item.id);

  return (
    <div>
      <div
        className="flex items-start border-l border-[#d8d0c1] py-1 text-sm leading-6 text-[#514a40]"
        style={{ marginLeft: inset }}
      >
        <button
          aria-expanded={isOpen}
          aria-label={`${isOpen ? "Collapse" : "Expand"} ${item.title}`}
          className="mt-1 flex size-4 shrink-0 items-center justify-center text-[#766b5d] transition-colors hover:text-[#191714]"
          onClick={() => {
            setOpenSections((current) => {
              const next = new Set(current);
              if (next.has(item.id)) next.delete(item.id);
              else next.add(item.id);
              return next;
            });
          }}
          type="button"
        >
          {isOpen ? <FiChevronDown aria-hidden /> : <FiChevronRight aria-hidden />}
        </button>
        <span className="min-w-0 flex-1 pl-2 font-medium">{item.title}</span>
      </div>

      {isOpen
        ? [...item.children]
            .sort((a, b) => a.order - b.order)
            .map((child) => (
              <CurriculumBranch
                activeUnitId={activeUnitId}
                depth={depth + 1}
                item={child}
                key={child.type === "unit" ? child.unit : child.id}
                maxDepth={maxDepth}
                onSelect={onSelect}
                openSections={openSections}
                setOpenSections={setOpenSections}
                unitsById={unitsById}
              />
            ))
        : null}
    </div>
  );
}
