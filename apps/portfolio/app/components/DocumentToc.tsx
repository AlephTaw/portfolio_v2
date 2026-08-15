"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { FiChevronDown, FiChevronRight } from "react-icons/fi";

type TocItem = {
  id: string;
  text: string;
  level: number;
};

type OutlineItem = TocItem & {
  hasChildren: boolean;
  parentId?: string;
};

const VIEW_LEVELS = [
  { label: "Domains", level: 1 },
  { label: "Subjects", level: 2 },
  { label: "Sections", level: 3 },
  { label: "Units", level: 4 },
] as const;

export function DocumentToc({ items }: { items: TocItem[] }) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? "");
  const [viewLevel, setViewLevel] = useState(3);
  const [branchOverrides, setBranchOverrides] = useState<Record<string, boolean>>({});
  const navRef = useRef<HTMLDivElement | null>(null);
  const linkRefs = useRef<Record<string, HTMLAnchorElement | null>>({});

  const outlineItems = useMemo<OutlineItem[]>(() => {
    const ancestors: TocItem[] = [];

    return items.map((item, index) => {
      while (ancestors.length && ancestors[ancestors.length - 1].level >= item.level) {
        ancestors.pop();
      }

      const outlineItem = {
        ...item,
        hasChildren: (items[index + 1]?.level ?? 0) > item.level,
        parentId: ancestors.at(-1)?.id,
      };

      ancestors.push(item);
      return outlineItem;
    });
  }, [items]);

  const itemVisibility = useMemo(() => {
    const visibility = new Map<string, boolean>();

    for (const item of outlineItems) {
      if (!item.parentId) {
        visibility.set(item.id, item.level <= viewLevel);
        continue;
      }

      const parentIsVisible = visibility.get(item.parentId) ?? false;
      const parentIsOpen = branchOverrides[item.parentId] ?? item.level <= viewLevel;
      visibility.set(item.id, parentIsVisible && parentIsOpen);
    }

    return visibility;
  }, [branchOverrides, outlineItems, viewLevel]);

  const visibleItems = useMemo(
    () => outlineItems.filter((item) => itemVisibility.get(item.id)),
    [itemVisibility, outlineItems],
  );
  const ids = useMemo(() => visibleItems.map((item) => item.id), [visibleItems]);
  const viewLabel = VIEW_LEVELS.find((option) => option.level === viewLevel)?.label;

  function cycleViewLevel() {
    const nextLevel = viewLevel === 4 ? 1 : viewLevel + 1;
    const activeIndex = outlineItems.findIndex((item) => item.id === activeId);
    const nearestVisibleItem = outlineItems
      .slice(0, Math.max(activeIndex, 0) + 1)
      .reverse()
      .find((item) => item.level <= nextLevel);

    setActiveId(nearestVisibleItem?.id ?? outlineItems[0]?.id ?? "");
    setBranchOverrides({});
    setViewLevel(nextLevel);
  }

  function toggleBranch(item: OutlineItem, isOpen: boolean) {
    setBranchOverrides((overrides) => ({
      ...overrides,
      [item.id]: !isOpen,
    }));
  }

  useEffect(() => {
    if (!ids.length) {
      return;
    }

    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => section !== null);

    if (!sections.length) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible[0]?.target.id) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        rootMargin: "-18% 0px -62% 0px",
        threshold: [0.1, 0.35, 0.6, 1],
      },
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, [ids]);

  useEffect(() => {
    const link = linkRefs.current[activeId];
    const container = navRef.current;

    if (!link || !container) {
      return;
    }

    const linkTop = link.offsetTop;
    const linkBottom = linkTop + link.offsetHeight;
    const containerTop = container.scrollTop;
    const containerBottom = containerTop + container.clientHeight;

    if (linkTop < containerTop || linkBottom > containerBottom) {
      container.scrollTo({
        top: Math.max(linkTop - container.clientHeight / 2, 0),
        behavior: "smooth",
      });
    }
  }, [activeId]);

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
        <div className="pane-scroll mt-5 max-h-[52vh] overflow-y-auto pr-2 lg:max-h-[calc(100vh-10rem)]" ref={navRef}>
          <nav aria-label="Document table of contents" className="space-y-1">
            {visibleItems.map((item, index) => {
              const nextItem = visibleItems[index + 1];
              const isOpen = item.hasChildren && Boolean(nextItem && nextItem.level > item.level);

              return (
                <div
                  className={[
                    "flex items-start border-l pl-1 text-sm leading-6 transition-colors",
                    item.level === 1
                      ? "ml-0"
                      : item.level === 2
                        ? "ml-3"
                        : item.level === 3
                          ? "ml-6"
                          : "ml-9",
                    activeId === item.id
                      ? "border-black text-[#191714]"
                      : "border-[#d8d0c1] text-[#766b5d] hover:border-[#766b5d] hover:text-[#191714]",
                  ].join(" ")}
                  key={item.id}
                >
                  {item.hasChildren ? (
                    <button
                      aria-expanded={isOpen}
                      aria-label={`${isOpen ? "Collapse" : "Expand"} ${item.text}`}
                      className="mt-1 flex size-4 shrink-0 items-center justify-center text-[#766b5d] transition-colors hover:text-[#191714]"
                      onClick={() => toggleBranch(item, isOpen)}
                      type="button"
                    >
                      {isOpen ? <FiChevronDown aria-hidden /> : <FiChevronRight aria-hidden />}
                    </button>
                  ) : (
                    <span aria-hidden className="size-4 shrink-0" />
                  )}
                  <Link
                    className="min-w-0 flex-1 pl-2"
                    href={`#${item.id}`}
                    ref={(element) => {
                      linkRefs.current[item.id] = element;
                    }}
                  >
                    {item.text}
                  </Link>
                </div>
              );
            })}
          </nav>
        </div>
      </div>
    </aside>
  );
}
