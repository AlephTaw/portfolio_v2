"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { FiMessageCircle } from "react-icons/fi";
import { commandOptions, getCommandText, type CommandOption } from "./quest-terminal-data";
import { useActiveActivity } from "./use-active-activity";
import { useQuestCommands } from "./use-quest-commands";

type ExecuteCommandControlProps = {
  commandLineActions?: ReactNode;
  variant?: "button" | "command-line";
};

export const toggleActivityWorkspaceEvent = "speedrun-irl:toggle-activity-workspace";
export const activityWorkspaceStateEvent = "speedrun-irl:activity-workspace-state";
export const editActivityNameEvent = "speedrun-irl:edit-activity-name";

export function SpeedrunCommandButton() {
  const [selected, setSelected] = useState(false);

  useEffect(() => {
    const updateState = (event: Event) => {
      setSelected((event as CustomEvent<{ open: boolean }>).detail.open);
    };
    window.addEventListener(activityWorkspaceStateEvent, updateState);
    return () => window.removeEventListener(activityWorkspaceStateEvent, updateState);
  }, []);

  return (
    <button
      aria-label={selected ? "Close activity workspace" : "Open activity workspace"}
      aria-pressed={selected}
      className={`pointer-events-auto grid size-10 cursor-pointer place-items-center rounded-[3px] border bg-black text-white transition-colors focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white ${selected ? "border-white" : "border-transparent hover:border-white/70"}`}
      onClick={() => window.dispatchEvent(new Event(toggleActivityWorkspaceEvent))}
      title={selected ? "Close activity workspace" : "Open activity workspace"}
      type="button"
    >
      <svg aria-hidden="true" className="h-[0.8rem] w-[1.2rem] -translate-x-[1px]" fill="none" viewBox="0 0 28 19">
        <path d="M7.91406 1H27.918" stroke="#CF1212" strokeWidth="2" />
        <path d="M0 10L28 10" stroke="#F1CD09" strokeWidth="2" />
        <path d="M13.1328 17.5234H27.9183" stroke="#6BB511" strokeWidth="2" />
      </svg>
    </button>
  );
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
  onSelect,
  selectedKey,
}: {
  activeIndex: number;
  commands: CommandOption[];
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

  return (
    <ul aria-label="Command suggestions" className="arr-scrollbar max-h-72 overflow-y-auto py-2" role="listbox">
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
}

export function ExecuteCommandControl({ commandLineActions, variant = "button" }: ExecuteCommandControlProps) {
  const { addCommand } = useQuestCommands();
  const { activeActivity, startActivity, updateActivityName } = useActiveActivity();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [editingActivityName, setEditingActivityName] = useState(false);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(-1);
  const filteredCommands = useMemo(() => filterCommands(query), [query]);
  const selectedCommand = commandOptions.find((command) => `${command.type}-${command.item}` === selectedKey) ?? null;
  const inferredCommand = selectedCommand ?? filteredCommands[activeIndex >= 0 ? activeIndex : 0] ?? null;

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
    setQuery(value);
    setSelectedKey(null);
    setActiveIndex(-1);
    if (variant === "command-line") setOpen(!editingActivityName && Boolean(value));
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
    setQuery(getCommandText(command));
    setOpen(variant === "button");
    if (variant === "command-line") requestAnimationFrame(() => inputRef.current?.focus());
  };

  const execute = (command: CommandOption | null) => {
    if (!command || command.locked) return;
    addCommand({ type: command.type, item: command.item });
    setQuery("");
    setSelectedKey(null);
    setOpen(false);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const sendChat = () => {
    const message = query.trim();
    if (!message || editingActivityName) return;
    addCommand({ type: "chat-message", item: message });
    setQuery("");
    setSelectedKey(null);
    setActiveIndex(-1);
    setOpen(false);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const executeTypedCommand = () => {
    const command = query.trim();
    if (!command) return;
    addCommand({ type: "terminal-command", item: command });
    setQuery("");
    setSelectedKey(null);
    setActiveIndex(-1);
    setOpen(false);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  if (variant === "command-line") {
    return (
      <div className="group/composer relative flex min-h-9 w-full items-center">
        <form
          className="flex min-w-0 flex-1 items-end rounded-[3px] border border-white/25 px-3 transition-colors focus-within:border-white/50"
          onSubmit={(event) => {
            event.preventDefault();
            if (editingActivityName) saveActivityName();
            else if (selectedCommand) execute(selectedCommand);
            else executeTypedCommand();
          }}
        >
          <label className="flex min-w-0 flex-1 items-start gap-3" htmlFor="terminal-command-input">
            <span aria-hidden="true" className="py-2">$</span>
            <span className="sr-only">Search commands</span>
            <span className="min-w-0 flex-1">
              <textarea
              aria-activedescendant={open && activeIndex >= 0 ? `command-option-${activeIndex}` : undefined}
              aria-autocomplete={editingActivityName ? "none" : "list"}
              aria-controls={editingActivityName ? undefined : "terminal-command-suggestions"}
              aria-expanded={!editingActivityName && open}
              aria-label={editingActivityName ? "Edit activity name" : "Command input"}
              autoComplete="off"
              className="block max-h-[50dvh] w-full min-w-0 resize-none caret-white bg-transparent py-2 font-mono text-sm leading-5 text-white outline-none placeholder:text-white/25 [caret-shape:block]"
              enterKeyHint="send"
              id="terminal-command-input"
              onChange={(event) => setSearch(event.target.value)}
              onFocus={() => {
                if (query && !editingActivityName) setOpen(true);
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
              placeholder={editingActivityName ? "Name this activity" : "What would you like to do?"}
              ref={inputRef}
              role="combobox"
              rows={1}
              value={query}
              />
            </span>
          </label>
          <button
            aria-label="Send as chat"
            className="grid size-8 shrink-0 place-items-center text-white/55 transition-colors hover:text-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:text-white/25 disabled:hover:text-white/25"
            disabled={!query.trim() || editingActivityName}
            onClick={sendChat}
            title="Send as chat"
            type="button"
          >
            <FiMessageCircle aria-hidden="true" className="size-4" />
          </button>
          <button className="sr-only" tabIndex={-1} type="submit">
            Submit command
          </button>
        </form>
        <span className="invisible pointer-events-none absolute bottom-[calc(100%+0.5rem)] inset-x-0 z-[60] flex h-10 items-center justify-center bg-black opacity-0 transition-opacity group-focus-within/composer:visible group-focus-within/composer:opacity-100 [&>*]:pointer-events-auto">
          {commandLineActions}
        </span>
        {open && (
          <div
            className="absolute bottom-[calc(100%+3.25rem)] inset-x-0 z-50 border border-white/35 bg-black"
            id="terminal-command-suggestions"
          >
            <div className="flex items-center justify-between gap-4 border-b border-white/15 px-4 py-3">
              <span className="text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-white/45">System Call</span>
              <span className="text-right text-[0.55rem] uppercase tracking-[0.12em] text-white/30">Tab to complete · Enter to execute</span>
            </div>
            <CommandList activeIndex={activeIndex} commands={filteredCommands} onSelect={chooseCommand} selectedKey={selectedKey} />
          </div>
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
