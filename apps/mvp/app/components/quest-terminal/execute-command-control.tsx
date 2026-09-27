"use client";

import { usePathname, useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { FiGrid, FiMic, FiPlus, FiX, FiXCircle } from "react-icons/fi";
import { ChatConversationPicker, useChatConversation } from "../chat-conversations";
import { InteractionsApp } from "../interactions-app";
import { useActivityWorkspace } from "../activity-workspace-context";
import { editActivityNameEvent } from "../activity-workspace-events";
import { KnapsackButton } from "../knapsack-button";
import { PinScrollArea } from "../pin-scroll-area";
import { findSpeedrunViewAction, speedrunViews } from "../speedrun-view-options";
import { findSplitScreenAction, SplitModeIcon, splitScreenActions, useApplySplitMode } from "../split-screen-actions";
import { useSplitView } from "../split-view-context";
import { useActionsView } from "../actions-view-context";
import { commandOptions, getCommandText, type CommandOption } from "./quest-terminal-data";
import { useActiveActivity } from "./use-active-activity";
import { useQuestCommands } from "./use-quest-commands";

type ExecuteCommandControlProps = {
  onDockElementChange?: (element: HTMLElement | null) => void;
  onSuggestionsOpenChange?: (open: boolean) => void;
  onChatPreviewExpandedChange?: (expanded: boolean) => void;
  variant?: "button" | "command-line";
};

const suggestedActions = [
  ...speedrunViews.map((option) => ({ ...option, kind: "view" as const })),
  ...splitScreenActions.map((option) => ({ ...option, kind: "split" as const })),
].sort((a, b) => a.actionLabel.localeCompare(b.actionLabel));

function parseComposerEntry(value: string) {
  const trimmed = value.trimStart();
  const prefix = trimmed.charAt(0);
  return {
    mode: prefix === "@" ? "chat" as const : prefix === "/" ? "command" as const : null,
    body: prefix === "@" || prefix === "/" ? trimmed.slice(1).trimStart() : trimmed,
  };
}

function filterCommands(query: string) {
  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (!terms.length) return commandOptions;

  return commandOptions.filter((command) => {
    const searchable = `${getCommandText(command)} ${command.typeLabel}`.toLowerCase();
    return terms.every((term) => searchable.includes(term));
  });
}

function CommandList({
  activeIndex,
  commands,
  inline = false,
  onSelect,
  selectedKey,
}: {
  activeIndex: number;
  commands: CommandOption[];
  inline?: boolean;
  onSelect: (command: CommandOption) => void;
  selectedKey: string | null;
}) {
  if (!commands.length) {
    return (
      <p className="px-4 py-8 text-center text-xs uppercase tracking-[0.14em] text-white/35">
        No matching commands
      </p>
    );
  }

  const list = (
    <ul aria-label="Command suggestions" className="py-2" role="listbox">
      {commands.map((command, index) => {
        const key = `${command.type}-${command.item}`;
        const highlighted = selectedKey ? selectedKey === key : index === activeIndex;

        return (
          <li key={key}>
            <button
              aria-disabled={command.locked}
              aria-selected={selectedKey === key}
              className={`grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-3 text-left transition-colors ${
                command.locked
                  ? "cursor-not-allowed text-white/25"
                  : highlighted
                    ? "cursor-pointer bg-white text-black"
                    : "cursor-pointer text-white/70 hover:bg-white hover:text-black"
              }`}
              disabled={command.locked}
              id={`command-option-${index}`}
              onClick={() => onSelect(command)}
              role="option"
              type="button"
            >
              <span className="min-w-0 font-mono text-xs uppercase tracking-[0.08em]">{command.item}</span>
              <span className="flex items-center justify-end gap-2">
                <span
                  className={`rounded-full px-2.5 py-1 text-[0.5rem] font-semibold uppercase tracking-[0.1em] ${
                    highlighted ? "bg-black/15 text-black" : "bg-white/15 text-white/65"
                  }`}
                >
                  {command.categoryLabel}
                </span>
                <span
                  className={`rounded-full px-2.5 py-1 text-[0.5rem] font-semibold uppercase tracking-[0.1em] ${
                    highlighted ? "bg-black text-white" : "bg-white/55 text-black"
                  }`}
                >
                  {command.typeLabel}
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );

  return inline ? list : <PinScrollArea className="max-h-72" wrapperClassName="max-h-72">{list}</PinScrollArea>;
}

export function ExecuteCommandControl({ onDockElementChange, onSuggestionsOpenChange, onChatPreviewExpandedChange, variant = "button" }: ExecuteCommandControlProps) {
  const { addCommand } = useQuestCommands();
  const { activeActivity, startActivity, updateActivityName } = useActiveActivity();
  const { setActivityOpen } = useActivityWorkspace();
  const { splitMode, splitViewOpen } = useSplitView();
  const applySplitMode = useApplySplitMode();
  const pathname = usePathname();
  const router = useRouter();
  const { conversation } = useChatConversation();
  const { setView, view } = useActionsView();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [chatExpanded, setChatExpanded] = useState(false);
  const [query, setQuery] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [editingActivityName, setEditingActivityName] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(-1);
  const { mode: entryMode, body: entryBody } = parseComposerEntry(query);
  const filteredCommands = useMemo(() => filterCommands(entryBody), [entryBody]);
  const selectedCommand = commandOptions.find((command) => `${command.type}-${command.item}` === selectedKey) ?? null;
  const inferredCommand = selectedCommand ?? filteredCommands[activeIndex >= 0 ? activeIndex : 0] ?? null;

  useEffect(() => {
    if (variant !== "command-line") return;
    onSuggestionsOpenChange?.(open);
  }, [onSuggestionsOpenChange, open, variant]);

  useEffect(() => {
    onChatPreviewExpandedChange?.(open && entryMode === "chat" && chatExpanded);
  }, [chatExpanded, entryMode, onChatPreviewExpandedChange, open]);

  useEffect(() => {
    if (variant !== "command-line") return;
    return () => {
      onSuggestionsOpenChange?.(false);
      onChatPreviewExpandedChange?.(false);
    };
  }, [onChatPreviewExpandedChange, onSuggestionsOpenChange, variant]);

  useLayoutEffect(() => {
    if (variant !== "command-line") return;
    const resize = () => {
      const textarea = inputRef.current;
      if (!textarea) return;
      textarea.style.height = "auto";
      const maxHeight = window.innerHeight * 0.5;
      textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
      textarea.style.overflowY = textarea.scrollHeight > maxHeight ? "auto" : "hidden";
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [query, variant]);

  useEffect(() => {
    if (variant !== "command-line") return;
    const beginEditing = (event: Event) => {
      const { name } = (event as CustomEvent<{ name: string }>).detail;
      inputRef.current?.focus();
      setEditingActivityName(true);
      setQuery(name === "Current activity" ? "" : name);
      setSelectedKey(null);
      setActiveIndex(-1);
      setOpen(false);
      requestAnimationFrame(() => inputRef.current?.select());
    };
    window.addEventListener(editActivityNameEvent, beginEditing);
    return () => window.removeEventListener(editActivityNameEvent, beginEditing);
  }, [variant]);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  const setSearch = (value: string) => {
    if (parseComposerEntry(value).mode !== "chat" || !open) setChatExpanded(false);
    setQuery(value);
    setSelectedKey(null);
    setActiveIndex(-1);
    if (variant === "command-line") setOpen(!editingActivityName && Boolean(parseComposerEntry(value).mode));
  };

  const saveActivityName = () => {
    const name = query.trim() || "Current activity";
    if (activeActivity) updateActivityName(name);
    else startActivity(name);
    setEditingActivityName(false);
    setQuery("");
    setOpen(false);
  };

  const chooseCommand = (command: CommandOption) => {
    if (command.locked) return;
    setSelectedKey(`${command.type}-${command.item}`);
    setQuery(variant === "command-line" ? `/${getCommandText(command)}` : getCommandText(command));
    setOpen(variant === "button");
    if (variant === "command-line") requestAnimationFrame(() => inputRef.current?.focus());
  };

  const executeSuggestedViewAction = (nextView: (typeof speedrunViews)[number]["view"]) => {
    setActivityOpen(false);
    setView(nextView);
    setQuery("");
    setSelectedKey(null);
    setActiveIndex(-1);
    setOpen(false);
    if (!splitViewOpen && pathname !== "/actions") router.push("/actions");
  };

  const executeSuggestedSplitAction = (mode: (typeof splitScreenActions)[number]["mode"]) => {
    applySplitMode(mode);
    setQuery("");
    setSelectedKey(null);
    setActiveIndex(-1);
    setOpen(false);
  };

  const execute = (command: CommandOption | null) => {
    if (!command || command.locked) return;
    addCommand({ type: command.type, item: command.item });
    setQuery("");
    setSelectedKey(null);
    setOpen(false);
    setAttachments([]);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const executeTypedCommand = () => {
    const command = entryBody.trim();
    if (!entryMode || !command) return;
    if (entryMode === "chat") {
      addCommand({ type: "chat-message", item: command, conversationId: conversation });
      setQuery("");
      setSelectedKey(null);
      setActiveIndex(-1);
      setOpen(false);
      setAttachments([]);
      requestAnimationFrame(() => inputRef.current?.focus());
      return;
    }
    const viewAction = findSpeedrunViewAction(command);
    if (viewAction) {
      executeSuggestedViewAction(viewAction.view);
      return;
    }
    const splitAction = findSplitScreenAction(command);
    if (splitAction) {
      executeSuggestedSplitAction(splitAction.mode);
      return;
    }
    addCommand({ type: "terminal-command", item: command });
    setQuery("");
    setSelectedKey(null);
    setActiveIndex(-1);
    setOpen(false);
    setAttachments([]);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  if (variant === "command-line") {
    return (
      <div className="group/composer relative flex w-full min-w-0 flex-col">
        <div aria-label="Composer dock" className="mb-1 flex min-h-7 w-full shrink-0 flex-col justify-center px-2">
          <div className="flex min-w-0 w-full items-center gap-0">
            <div id="composer-activity-summary-slot" className="min-w-0 flex-[0_1_auto] empty:hidden" ref={onDockElementChange} />
            <KnapsackButton />
          </div>
          {inputFocused && !editingActivityName && <span className="font-sans text-[0.65rem] text-white/55" id="composer-prefix-hint">Start with <span className="text-white">@</span> for chat or <span className="text-white">/</span> for a command</span>}
        </div>
        <form
          className="flex min-w-0 min-h-12 flex-1 items-end rounded-2xl border border-white/20 bg-white/[0.06] px-2 shadow-[0_10px_30px_rgba(0,0,0,0.25)] transition-colors focus-within:border-white/45"
          onSubmit={(event) => {
            event.preventDefault();
            if (editingActivityName) saveActivityName();
            else if (entryMode === "command" && selectedCommand) execute(selectedCommand);
            else executeTypedCommand();
          }}
        >
          <button
              aria-label="Attach files"
              className="mb-1 grid size-9 shrink-0 cursor-pointer place-items-center rounded-full text-white/55 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white"
              onClick={(event) => { event.preventDefault(); fileInputRef.current?.click(); }}
              title="Attach files"
              type="button"
            >
              <FiPlus aria-hidden="true" className="size-4" />
          </button>
          <input
              aria-label="Choose files to attach"
              className="sr-only"
              multiple
              onChange={(event) => { setAttachments(Array.from(event.target.files ?? [])); event.target.value = ""; }}
              ref={fileInputRef}
              tabIndex={-1}
              type="file"
          />
          <div className="min-w-0 flex-1">
              {attachments.length > 0 && <div className="flex flex-wrap gap-1 pt-1">
                {attachments.map((file, index) => <button aria-label={`Remove ${file.name}`} className="inline-flex max-w-40 items-center gap-1 truncate border border-white/30 px-1.5 py-0.5 font-mono text-[0.55rem] text-white/65" key={`${file.name}-${index}`} onClick={(event) => { event.preventDefault(); setAttachments((files) => files.filter((_, fileIndex) => fileIndex !== index)); }} type="button">{file.name}<FiX aria-hidden="true" className="size-3 shrink-0" /></button>)}
              </div>}
              <label className="block" htmlFor="terminal-command-input"><span className="sr-only">{entryMode === "chat" ? "Write a chat message" : "Search commands"}</span>
              <textarea
              aria-activedescendant={entryMode === "command" && open && activeIndex >= 0 ? `command-option-${activeIndex}` : undefined}
              aria-autocomplete={editingActivityName || entryMode !== "command" ? "none" : "list"}
              aria-controls={editingActivityName ? undefined : "terminal-command-suggestions"}
              aria-describedby={inputFocused && !editingActivityName ? "composer-prefix-hint" : undefined}
              aria-expanded={!editingActivityName && open}
              aria-label={editingActivityName ? "Edit activity name" : "Chat or command input"}
              autoComplete="off"
              className="block max-h-[50dvh] w-full min-w-0 resize-none caret-white bg-transparent px-1 py-3 font-sans text-sm leading-6 text-white outline-none placeholder:text-white/40"
              enterKeyHint="send"
              id="terminal-command-input"
              onChange={(event) => setSearch(event.target.value)}
              onBlur={(event) => {
                if (!(event.relatedTarget instanceof HTMLElement && event.relatedTarget.hasAttribute("data-composer-dismiss"))) setInputFocused(false);
              }}
              onFocus={() => {
                setInputFocused(true);
                if (entryMode && !editingActivityName) setOpen(true);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
                  event.preventDefault();
                  event.currentTarget.form?.requestSubmit();
                  return;
                }
                if (editingActivityName && event.key === "Escape") {
                  setEditingActivityName(false);
                  setQuery("");
                  setOpen(false);
                } else if (editingActivityName) {
                  return;
                } else if (entryMode === "chat") {
                  return;
                } else if (event.key === "ArrowDown") {
                  event.preventDefault();
                  setOpen(true);
                  setActiveIndex((index) => Math.min(index + 1, Math.max(filteredCommands.length - 1, 0)));
                } else if (event.key === "ArrowUp") {
                  event.preventDefault();
                  setActiveIndex((index) => Math.max(index - 1, 0));
                } else if (event.key === "Tab" && inferredCommand) {
                  event.preventDefault();
                  chooseCommand(inferredCommand);
                }
              }}
              placeholder={editingActivityName ? "Name this activity" : "...Advance"}
              ref={inputRef}
              role="combobox"
              rows={1}
              value={query}
              />
              </label>
          </div>
          <div aria-label="Composer controls" className={`ml-1 flex w-[6.75rem] shrink-0 items-center ${inputFocused ? "mt-1 self-start" : "mb-1"}`}>
            <button
              aria-label="Voice input (coming soon)"
              aria-disabled="true"
              className="grid size-9 shrink-0 cursor-default place-items-center rounded-full text-white/55 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white"
              title="Voice input is not connected yet"
              type="button"
            >
              <FiMic aria-hidden="true" className="size-4" />
            </button>
            {inputFocused ? (
              <button
                aria-label="Clear prompt and close preview"
                data-composer-dismiss
                className="ml-auto grid size-9 shrink-0 cursor-pointer place-items-center rounded-full text-white/55 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white"
                onPointerDown={(event) => event.preventDefault()}
                onBlur={() => setInputFocused(false)}
                onClick={() => {
                  setSearch("");
                  inputRef.current?.blur();
                  setInputFocused(false);
                  setOpen(false);
                }}
                type="button"
              >
                <FiXCircle aria-hidden="true" className="size-5" />
              </button>
            ) : ([{ prefix: "@", mode: "chat", label: "Chat mode" }, { prefix: "/", mode: "command", label: "Command mode" }] as const).map(({ prefix, mode, label }) => (
              <button
                key={mode}
                type="button"
                aria-label={label}
                aria-pressed={!editingActivityName && entryMode === mode}
                disabled={editingActivityName}
                className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-full font-mono text-lg text-white/55 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-default disabled:opacity-30"
                onClick={() => {
                  setSearch(`${prefix}${entryBody}`);
                  requestAnimationFrame(() => {
                    inputRef.current?.focus();
                    inputRef.current?.setSelectionRange(1, 1);
                  });
                }}
              >
                {prefix}
              </button>
            ))}
          </div>
          <button className="sr-only" tabIndex={-1} type="submit">
            Submit entry
          </button>
        </form>
        {open && typeof document !== "undefined" && document.getElementById("command-suggestions-pane") && createPortal(
          <div className="relative h-full min-h-0 bg-black" id="terminal-command-suggestions">
            <button aria-label="Close suggestions" className="absolute right-3 top-2 z-20 grid size-8 cursor-pointer place-items-center rounded-full bg-black text-white/65 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-white" onClick={() => { setOpen(false); setChatExpanded(false); }} type="button"><FiX aria-hidden="true" className="size-4" /></button>
            {entryMode === "chat" ? chatExpanded ? <InteractionsApp embedded /> : <PinScrollArea aria-label="Chat conversations" wrapperClassName="h-full"><h2 className="px-4 pb-1 pr-12 pt-3 text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-white/45">Choose a conversation</h2><ChatConversationPicker onSelect={() => setChatExpanded(true)} /></PinScrollArea> : <PinScrollArea aria-label="Suggested actions and system calls" wrapperClassName="h-full">
              <section aria-labelledby="suggested-actions-heading" className="border-b border-white/15">
                <h2 className="px-4 pb-1 pr-12 pt-3 text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-white/45" id="suggested-actions-heading">Suggested Actions</h2>
                <ul aria-label="Suggested actions" className="pb-2">
                  {suggestedActions.map((action) => (
                    <li key={action.actionLabel}>
                      <button
                        aria-current={(action.kind === "view" ? view === action.view : splitMode === action.mode) ? "true" : undefined}
                        className="flex min-h-9 w-full cursor-pointer items-center gap-3 px-4 text-left text-xs text-white/70 transition-colors hover:bg-white/10 hover:text-white focus-visible:bg-white/10 focus-visible:text-white focus-visible:outline-none"
                        onClick={() => action.kind === "view" ? executeSuggestedViewAction(action.view) : executeSuggestedSplitAction(action.mode)}
                        type="button"
                      >
                        <span className="grid w-6 shrink-0 place-items-center">
                          {action.kind === "view" ? <action.icon aria-hidden="true" className="size-4" /> : <SplitModeIcon mode={action.mode} />}
                        </span>
                        <span>{action.actionLabel}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
              <div className="flex items-center justify-between gap-4 border-b border-white/15 px-4 py-3">
                <span className="text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-white/45">System Calls</span>
                <span className="flex items-center gap-2 text-right text-[0.55rem] uppercase tracking-[0.12em] text-white/30"><FiGrid aria-hidden="true" className="size-4 shrink-0" /><span className="hidden sm:inline">Tab to complete · Enter to execute</span></span>
              </div>
              <CommandList activeIndex={activeIndex} commands={filteredCommands} inline onSelect={chooseCommand} selectedKey={selectedKey} />
            </PinScrollArea>}
          </div>,
          document.getElementById("command-suggestions-pane")!,
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        aria-expanded={open}
        className="cursor-pointer border border-white/35 px-4 py-2 text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-white/70 transition-colors hover:border-white hover:text-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-white"
        onClick={() => setOpen(true)}
        type="button"
      >
        Execute Command
      </button>

      {open && (
        <div
          aria-labelledby="command-palette-title"
          aria-modal="true"
          className="fixed inset-0 z-50 grid place-items-center bg-black/85 p-4 sm:p-8"
          onClick={() => setOpen(false)}
          role="dialog"
        >
          <section className="w-full max-w-2xl border border-white/40 bg-black text-white" onClick={(event) => event.stopPropagation()}>
            <header className="flex items-start justify-between gap-8 border-b border-white/25 p-5 sm:p-6">
              <div>
                <p className="text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-white/40">Execute Command</p>
                <h2 className="mt-2 text-sm font-semibold uppercase tracking-[0.18em]" id="command-palette-title">Search all commands</h2>
              </div>
              <button className="cursor-pointer text-xs uppercase tracking-[0.14em] text-white/50 hover:text-white" onClick={() => setOpen(false)} type="button">Close</button>
            </header>
            <div className="border-b border-white/25 p-5 sm:p-6">
              <label className="sr-only" htmlFor="command-palette-search">Search commands</label>
              <input
                autoComplete="off"
                autoFocus
                className="w-full border border-white/35 bg-black px-4 py-3 font-mono text-sm text-white outline-none placeholder:text-white/30 focus:border-white"
                id="command-palette-search"
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by command, category, or type"
                value={query}
              />
            </div>
            <CommandList activeIndex={activeIndex} commands={filteredCommands} onSelect={chooseCommand} selectedKey={selectedKey} />
            <footer className="flex items-center justify-between gap-4 border-t border-white/25 p-5 sm:p-6">
              <span className="text-xs text-white/35">{filteredCommands.length} matching commands</span>
              <button
                className="cursor-pointer border border-white bg-white px-5 py-3 text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-black transition-opacity disabled:cursor-not-allowed disabled:opacity-30"
                disabled={!selectedCommand}
                onClick={() => execute(selectedCommand)}
                type="button"
              >
                Execute
              </button>
            </footer>
          </section>
        </div>
      )}
    </div>
  );
}
