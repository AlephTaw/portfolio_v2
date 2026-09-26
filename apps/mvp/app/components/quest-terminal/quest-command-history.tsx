"use client";

import { Fragment, useLayoutEffect } from "react";
import { PinScrollThumb, usePinScrollThumb } from "../pin-scroll-area";
import { getSystemLabel } from "./quest-terminal-data";
import { useQuestCommands } from "./use-quest-commands";

function formatDay(executedAt?: string) {
  if (!executedAt) return null;

  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "America/New_York",
  }).format(new Date(executedAt));
}

function formatTime(executedAt?: string) {
  if (!executedAt) return null;

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "America/New_York",
  }).format(new Date(executedAt));
}

function getLocalDayKey(executedAt?: string) {
  if (!executedAt) return null;
  const date = new Date(executedAt);
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

export function QuestCommandHistory({
  scrollable = false,
}: {
  scrollable?: boolean;
}) {
  const { commands } = useQuestCommands();
  const { scrollRef, thumbRef, updateThumb } = usePinScrollThumb(scrollable);

  useLayoutEffect(() => {
    if (!scrollable) return;
    const container = scrollRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
      updateThumb();
    }
  }, [commands, scrollable, scrollRef, updateThumb]);
  const entries: { key: string; command: string; executedAt?: string; systemLabel?: string; kind: "command" | "chat" }[] = [
    {
      key: "route-calibration",
      command: "route_calibration",
      executedAt: commands[0]?.executedAt,
      kind: "command",
    },
    ...commands.map((command, index) => ({
      key: `${command.type}-${command.item}-${command.executedAt ?? index}`,
      command: command.item,
      executedAt: command.executedAt,
      systemLabel: getSystemLabel(command.type),
      kind: command.type === "chat-message" ? "chat" as const : "command" as const,
    })),
  ];
  let previousDayKey: string | null = null;

  return (
    <div className={scrollable ? "relative min-h-0 flex-1" : ""}>
      <div className={scrollable ? "pin-scrollbar h-full overflow-y-auto overscroll-contain pb-[calc(var(--composer-height)+1rem)]" : ""} ref={scrollable ? scrollRef : undefined}>
        <ul aria-label="Active quest command history" className="flex flex-col gap-1 py-3">
          {entries.map((entry) => {
            const dayKey = getLocalDayKey(entry.executedAt);
            const startsDay = Boolean(dayKey && dayKey !== previousDayKey);
            previousDayKey = dayKey;

            return (
              <Fragment key={entry.key}>
                {startsDay && (
                  <li className="flex justify-center py-2">
                    <time
                      className="rounded-full bg-white/[0.06] px-3 py-1 text-[0.6rem] text-white/40"
                      dateTime={entry.executedAt}
                    >
                      {formatDay(entry.executedAt)}
                    </time>
                  </li>
                )}
                <li className="flex justify-end">
                  <div className="group/entry relative w-fit max-w-[min(85%,40rem)] py-5">
                    <span className="pointer-events-none absolute right-1 top-1 whitespace-nowrap text-[0.6rem] font-semibold uppercase tracking-[0.1em] text-white/45 opacity-0 transition-opacity group-hover/entry:opacity-100 group-focus-within/entry:opacity-100">
                      {entry.kind === "chat" ? "Chat" : entry.systemLabel || "Command"}
                    </span>
                    <article className="rounded-2xl rounded-br-sm border border-white/10 bg-white/[0.06] px-4 py-3 text-left focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white" tabIndex={0}>
                      <p className="whitespace-pre-wrap break-words font-sans text-sm leading-6 text-white/85">{entry.command}</p>
                    </article>
                    {entry.executedAt && <time className="pointer-events-none absolute bottom-1 right-1 whitespace-nowrap text-[0.6rem] tabular-nums text-white/35 opacity-0 transition-opacity group-hover/entry:opacity-100 group-focus-within/entry:opacity-100" dateTime={entry.executedAt}>{formatTime(entry.executedAt)}</time>}
                  </div>
                </li>
              </Fragment>
            );
          })}
        </ul>
      </div>
      {scrollable && <PinScrollThumb thumbRef={thumbRef} />}
    </div>
  );
}
