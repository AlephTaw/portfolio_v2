"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { FiMessageCircle, FiX } from "react-icons/fi";
import {
  communicationsStateEvent,
  pageTransitionEvent,
  toggleCommunicationsEvent,
  toggleMinimapEvent,
  WORLD_ORIGIN_KEY,
  WORLD_VIEW_STATE_KEY,
  type CommunicationsStateDetail,
  type PageTransitionDetail,
} from "./page-transition-events";
import { SpeedrunCommandButton } from "./quest-terminal";
import { PinScrollArea } from "./pin-scroll-area";
import { useQuestCommands } from "./quest-terminal/use-quest-commands";
import { useRightRailVisibility } from "./right-rail-visibility-context";
import { useSplitView } from "./split-view-context";

export function MinimapRail() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  const isWorld = pathname === "/world";
  const [chatOpen, setChatOpen] = useState(false);
  const { commands } = useQuestCommands();
  const chatMessages = commands.filter((command) => command.type === "chat-message");
  const { hidden: rightRailHidden, reveal: revealRightRail } = useRightRailVisibility();
  const railRef = useRef<HTMLElement>(null);
  const { leftPane, setLeftPane, splitMode, splitRatio, splitViewOpen } = useSplitView();

  useEffect(() => {
    if (isWorld) return;
    window.sessionStorage.setItem(
      WORLD_ORIGIN_KEY,
      `${pathname}${search ? `?${search}` : ""}`,
    );
  }, [isWorld, pathname, search]);

  useEffect(() => {
    if (!chatOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setChatOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [chatOpen]);

  useEffect(() => {
    const toggleCommunications = () => setChatOpen((open) => !open);
    window.addEventListener(toggleCommunicationsEvent, toggleCommunications);
    return () => window.removeEventListener(toggleCommunicationsEvent, toggleCommunications);
  }, []);

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent<CommunicationsStateDetail>(communicationsStateEvent, {
        detail: { open: chatOpen },
      }),
    );
  }, [chatOpen]);

  useEffect(() => {
    if (!rightRailHidden) return;

    const revealIfOverRail = (x: number, y: number) => {
      const bounds = railRef.current?.getBoundingClientRect();
      if (bounds && x >= bounds.left && x <= bounds.right && y >= bounds.top && y <= bounds.bottom) revealRightRail();
    };
    const onPointerMove = (event: PointerEvent) => revealIfOverRail(event.clientX, event.clientY);
    const onTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (touch) revealIfOverRail(touch.clientX, touch.clientY);
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, [rightRailHidden, revealRightRail]);

  const prepareTransition = useCallback((to: string, direction: -1 | 0 | 1 = 0) => {
    const destination = new URL(to, window.location.origin);
    window.dispatchEvent(
      new CustomEvent<PageTransitionDetail>(pageTransitionEvent, {
        detail: {
          direction,
          from: window.location.pathname,
          to: destination.pathname,
        },
      }),
    );
  }, []);

  const navigateMinimap = useCallback(() => {
    if (splitViewOpen) {
      if (leftPane !== "world") {
        window.sessionStorage.setItem(
          WORLD_VIEW_STATE_KEY,
          JSON.stringify({
            returnLocation: "Workshop",
            selectedLocation: "Workshop",
            workshopApplication: null,
            worldTreeFocused: false,
          }),
        );
      }
      setLeftPane(leftPane === "world" ? "stats" : "world");
      return;
    }

    if (!isWorld) {
      window.sessionStorage.setItem(
        WORLD_ORIGIN_KEY,
        `${window.location.pathname}${window.location.search}`,
      );
      prepareTransition("/world?domain=workshop");
      router.push("/world?domain=workshop");
      return;
    }

    const storedOrigin = window.sessionStorage.getItem(WORLD_ORIGIN_KEY);
    const destination = storedOrigin?.startsWith("/") ? storedOrigin : "/stats";
    prepareTransition(destination, 1);
    router.push(destination);
  }, [isWorld, leftPane, prepareTransition, router, setLeftPane, splitViewOpen]);

  useEffect(() => {
    window.addEventListener(toggleMinimapEvent, navigateMinimap);
    return () => window.removeEventListener(toggleMinimapEvent, navigateMinimap);
  }, [navigateMinimap]);

  return (
    <>
      <aside
        aria-label="Application navigation"
        className="pointer-events-none fixed inset-0 z-[120]"
      >
        <div className={`mx-auto flex h-dvh w-full justify-end pr-[clamp(1.5rem,4.4vw,3.5rem)] ${splitViewOpen ? "" : "max-w-[72rem]"}`}>
          <nav aria-label="Page navigation" aria-hidden={rightRailHidden} inert={rightRailHidden} className={`flex h-dvh w-10 flex-col items-center transition-opacity duration-200 ease-out motion-reduce:transition-none ${rightRailHidden ? "opacity-0" : "opacity-100"}`} ref={railRef}>
          <div
            className="mt-auto flex flex-col items-center gap-3"
            style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
          >
            <span aria-hidden="true" className="size-10 shrink-0" />
            <div aria-hidden={chatOpen || undefined} className={chatOpen ? "pointer-events-none opacity-0" : "pointer-events-auto"}>
              <SpeedrunCommandButton />
            </div>
            <span aria-hidden="true" className="h-[3.25rem] shrink-0" />
          </div>
          </nav>
        </div>
      </aside>

      {chatOpen && (
        <div
          aria-labelledby="communications-modal-title"
          className="pointer-events-auto fixed z-[110] grid place-items-center bg-black/85 p-4 pb-20 sm:px-8 sm:pb-20 sm:pt-8"
          onClick={() => setChatOpen(false)}
          role="dialog"
          style={splitMode === "vertical"
            ? { bottom: 0, left: `${splitRatio}%`, right: 0, top: 0 }
            : splitMode === "horizontal"
              ? { bottom: 0, left: 0, right: 0, top: `${splitRatio}%` }
              : { inset: 0 }}
        >
          <section
            className="flex h-full max-h-[48rem] w-full max-w-6xl flex-col overflow-hidden border border-white/40 bg-black text-white"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="flex items-start justify-between gap-8 border-b border-white/25 p-5 sm:p-6">
              <div>
                <p className="text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-white/40">
                  Communications
                </p>
                <h2
                  className="mt-2 text-sm font-semibold uppercase tracking-[0.18em]"
                  id="communications-modal-title"
                >
                  Actions, Queues & Messaging
                </h2>
              </div>
              <button
                aria-label="Close communications"
                autoFocus
                className="grid size-8 cursor-pointer place-items-center text-white/50 transition-colors hover:text-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white"
                onClick={() => setChatOpen(false)}
                type="button"
              >
                <FiX aria-hidden="true" className="size-5" />
              </button>
            </header>

            <PinScrollArea
              aria-label="Threads"
              className="p-5 sm:p-6"
              id="communications-threads-panel"
              wrapperClassName="flex-1"
            >
              <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-white/55" id="communications-threads-heading">Threads</h3>
              {chatMessages.length ? (
                <ol aria-labelledby="communications-threads-heading" className="mt-5 space-y-3">
                  {chatMessages.map((message, index) => (
                    <li className="flex items-start gap-3 border border-white/20 p-4" key={`${message.executedAt ?? index}-${index}`}>
                      <FiMessageCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-white/60" />
                      <div className="min-w-0 flex-1">
                        <p className="whitespace-pre-wrap break-words text-sm text-white/85">{message.item}</p>
                        {message.executedAt && <time className="mt-2 block font-mono text-[0.55rem] text-white/35" dateTime={message.executedAt}>{new Date(message.executedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</time>}
                      </div>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="mt-6 text-xs uppercase tracking-[0.14em] text-white/30">No active threads</p>
              )}
            </PinScrollArea>
          </section>
        </div>
      )}
    </>
  );
}
