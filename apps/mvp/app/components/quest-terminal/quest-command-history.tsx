"use client";

import { Fragment, useLayoutEffect } from "react";
import { FiMessageCircle } from "react-icons/fi";
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
  showPrompt = false,
  scrollable = false,
}: {
  showPrompt?: boolean;
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
      <div className={scrollable ? "pin-scrollbar h-full overflow-y-auto overscroll-contain pb-12 pr-2" : ""} ref={scrollable ? scrollRef : undefined}>
        <div className="relative">
        <ul aria-label="Active quest command history" className="space-y-3">
          {entries.map((entry) => {
            const dayKey = getLocalDayKey(entry.executedAt);
            const startsDay = Boolean(dayKey && dayKey !== previousDayKey);
            previousDayKey = dayKey;

            return (
              <Fragment key={entry.key}>
                {startsDay && (
                  <li className="flex items-center gap-4 py-2">
                    <span aria-hidden="true" className="h-px flex-1 bg-white/15" />
                    <time
                      className="shrink-0 font-mono text-[0.55rem] uppercase tracking-[0.12em] text-white/35"
                      dateTime={entry.executedAt}
                    >
                      {formatDay(entry.executedAt)}
                    </time>
                  </li>
                )}
                <li>
                  <div className={`grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3 font-mono text-[0.65rem] text-white/70 ${entry.kind === "chat" ? "normal-case tracking-normal" : "uppercase tracking-[0.1em]"}`}>
                    {entry.kind === "chat" ? <FiMessageCircle aria-label="Chat message" className="mt-0.5 size-3.5" /> : <span aria-hidden="true" className="text-white/45">$</span>}
                    <span className="min-w-0 whitespace-pre-wrap break-words">
                      {entry.systemLabel && (
                        <>
                          <span className="text-white/35">{entry.systemLabel}</span>
                          <span className="mx-2 text-white/20">/</span>
                        </>
                      )}
                      {entry.command}
                    </span>
                    {entry.executedAt && (
                      <time
                        className="text-right text-[0.55rem] normal-case tracking-normal text-white/30"
                        dateTime={entry.executedAt}
                      >
                        {formatTime(entry.executedAt)}
                      </time>
                    )}
                  </div>
                </li>
              </Fragment>
            );
          })}
        </ul>
        </div>
        {showPrompt && (
          <div aria-hidden="true" className="mt-4 flex items-center gap-3 font-mono text-[0.65rem] text-white/35">
            <span>$</span>
            <span className="terminal-cursor h-3 w-1.5 bg-white/80" />
          </div>
        )}
      </div>
      {scrollable && <PinScrollThumb thumbRef={thumbRef} />}
    </div>
  );
}
