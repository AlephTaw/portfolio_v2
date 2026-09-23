"use client";

import { CollectionManager } from "@/src/apps/collections/CollectionManager";

export function Achievements({ compact = false }: { compact?: boolean }) {
  return (
    <CollectionManager
      collection="achievements"
      showHeading={!compact}
    />
  );
}
