"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  CurriculumCatalog,
  CurriculumViewItem,
} from "../../lib/curriculum";
import { CurriculumToc } from "./CurriculumToc";
import { CurriculumUnitFrame } from "./CurriculumUnitFrame";

function unitIdsIn(items: CurriculumViewItem[]): string[] {
  return items.flatMap((item) =>
    item.type === "unit" ? [item.unit] : unitIdsIn(item.children),
  );
}

export function CurriculumReader({ catalog }: { catalog: CurriculumCatalog }) {
  const view = catalog.views.default;
  const orderedUnitIds = useMemo(() => unitIdsIn(view.items), [view.items]);
  const unitsById = useMemo(
    () => new Map(catalog.units.map((unit) => [unit.id, unit])),
    [catalog.units],
  );
  const [activeUnitId, setActiveUnitId] = useState(orderedUnitIds[0] ?? "");

  useEffect(() => {
    const unitId = window.location.hash.replace(/^#unit-/, "");
    if (unitsById.has(unitId)) setActiveUnitId(unitId);
  }, [unitsById]);

  const activeUnit = unitsById.get(activeUnitId) ?? unitsById.get(orderedUnitIds[0]);

  function selectUnit(unitId: string) {
    setActiveUnitId(unitId);
    window.history.replaceState(null, "", `#unit-${unitId}`);
  }

  if (!activeUnit) return null;

  return (
    <section className="grid gap-10 lg:grid-cols-[minmax(14rem,16rem)_minmax(0,1fr)] lg:items-start">
      <CurriculumToc
        activeUnitId={activeUnit.id}
        onSelect={selectUnit}
        unitsById={unitsById}
        view={view}
      />
      <CurriculumUnitFrame unit={activeUnit} />
    </section>
  );
}
