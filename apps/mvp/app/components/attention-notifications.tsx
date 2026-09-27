// Mock attention items until notification data is available.
type AttentionNotification = { id: string; title: string; detail: string };

export const worldTreeNotifications: AttentionNotification[] = [
  { id: "world-tree-health", title: "World Tree health", detail: "Review the World Tree health summary." },
  { id: "domain-progress", title: "Domain progress", detail: "A domain has progress ready to review." },
  { id: "world-map-update", title: "World map update", detail: "A new world-map update needs your attention." },
];

export const mapPlanNotifications: AttentionNotification[] = [
  {
    id: "review-current-plan",
    title: "Review current plan",
    detail: "Your plan has an action ready for review.",
  },
  { id: "review-running-tasks", title: "Review running tasks", detail: "Check the tasks currently in progress." },
];

export function AttentionCountBadge({ count, className = "" }: { count: number; className?: string }) {
  if (count === 0) return null;

  return (
    <span
      aria-label={`${count} ${count === 1 ? "action needs" : "actions need"} attention`}
      className={`pointer-events-none absolute -right-1 -top-1 z-40 grid min-h-5 min-w-5 place-items-center rounded-full bg-white px-1 text-[0.65rem] font-semibold leading-none text-black shadow-[0_0_0_2px_black] ${className}`}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}
