"use client";

import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { FiMessageCircle } from "react-icons/fi";
import { useQuestCommands } from "./quest-terminal/use-quest-commands";

function ChatPopover() {
  const { commands } = useQuestCommands();
  const [position, setPosition] = useState<{ left: number; top: number } | null>(null);
  const dragRef = useRef<{ offsetX: number; offsetY: number } | null>(null);
  const messages = commands.filter((command) => command.type === "chat-message").slice(-8);
  const feed = [
    { sender: "Raphael", item: "Hey, I'm here. What are we working on today?", executedAt: "" },
    ...messages.map((message) => ({ ...message, sender: "You" })),
  ];

  return (
    <section aria-label="Chat feed" className="pointer-events-auto fixed z-[130] flex h-64 w-[min(21rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-md border border-white/25 bg-[#111] shadow-2xl" style={position ? { left: position.left, top: position.top } : { bottom: "calc(var(--composer-height) + 1rem)", right: "var(--rail-edge-inset)" }}>
      <header
        className="flex cursor-grab touch-none select-none items-center justify-between border-b border-white/15 px-3 py-2 active:cursor-grabbing"
        onPointerDown={(event) => {
          const rect = event.currentTarget.parentElement?.getBoundingClientRect();
          if (!rect) return;
          dragRef.current = { offsetX: event.clientX - rect.left, offsetY: event.clientY - rect.top };
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          if (!dragRef.current) return;
          const width = event.currentTarget.parentElement?.offsetWidth ?? 336;
          const height = event.currentTarget.parentElement?.offsetHeight ?? 256;
          setPosition({
            left: Math.max(8, Math.min(window.innerWidth - width - 8, event.clientX - dragRef.current.offsetX)),
            top: Math.max(8, Math.min(window.innerHeight - height - 8, event.clientY - dragRef.current.offsetY)),
          });
        }}
        onPointerUp={(event) => {
          dragRef.current = null;
          event.currentTarget.releasePointerCapture(event.pointerId);
        }}
        onPointerCancel={() => { dragRef.current = null; }}
      >
        <span className="text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-white/70">Chat</span>
        <span className="flex items-center gap-1.5 text-[0.5rem] uppercase tracking-[0.12em] text-white/35"><span className="size-1.5 rounded-full bg-white/70" />Live</span>
      </header>
      <ol className="min-h-0 flex-1 space-y-2 overflow-y-auto px-3 py-3 text-xs leading-5">
        {feed.map((message, index) => (
          <li className="break-words" key={`${message.executedAt ?? "message"}-${index}`}>
            <span className="mr-2 font-semibold text-white/65">{message.sender}</span>
            <span className="text-white/75">{message.item}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function ChatFeedToggle() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  if (pathname === "/state" || pathname === "/interactions") return null;
  const overlay = open ? document.getElementById("chat-feed-overlay") : null;

  return (
    <>
      <button
        aria-label={open ? "Hide chat" : "Show chat"}
        aria-pressed={open}
        className={`grid size-10 shrink-0 cursor-pointer place-items-center rounded-[4px] border bg-black transition-colors focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white ${open ? "border-white text-white" : "border-transparent text-white/55 hover:border-white/55 hover:text-white"}`}
        onClick={() => setOpen((visible) => !visible)}
        type="button"
      >
        <FiMessageCircle aria-hidden="true" className="size-5" />
      </button>
      {overlay && createPortal(<ChatPopover />, overlay)}
    </>
  );
}
