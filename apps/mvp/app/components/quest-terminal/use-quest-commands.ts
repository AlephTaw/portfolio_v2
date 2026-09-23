"use client";

import { useCallback, useEffect, useState } from "react";
import { defaultQuestCommands, type QuestCommand } from "./quest-terminal-data";

const storageKey = "speedrun-irl:quest-commands";
const updateEvent = "speedrun-irl:quest-commands-updated";

function readCommands() {
  if (typeof window === "undefined") return defaultQuestCommands;

  try {
    const stored = window.localStorage.getItem(storageKey);
    const parsed = stored ? (JSON.parse(stored) as QuestCommand[]) : defaultQuestCommands;
    const migrationTimestamp = new Date().toISOString();
    const commands = parsed.map((command) => ({
      ...command,
      executedAt: command.executedAt ?? migrationTimestamp,
    }));

    if (!stored || parsed.some((command) => !command.executedAt)) {
      window.localStorage.setItem(storageKey, JSON.stringify(commands));
    }

    return commands;
  } catch {
    return defaultQuestCommands;
  }
}

export function useQuestCommands() {
  const [commands, setCommands] = useState<QuestCommand[]>(defaultQuestCommands);

  useEffect(() => {
    const sync = () => setCommands(readCommands());
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener(updateEvent, sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(updateEvent, sync);
    };
  }, []);

  const addCommand = useCallback((command: QuestCommand) => {
    const current = readCommands();
    const next = [...current, { ...command, executedAt: new Date().toISOString() }];
    window.localStorage.setItem(storageKey, JSON.stringify(next));
    setCommands(next);
    window.dispatchEvent(new Event(updateEvent));
  }, []);

  return { addCommand, commands };
}
