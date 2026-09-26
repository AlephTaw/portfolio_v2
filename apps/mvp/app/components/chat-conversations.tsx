"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { FiMessageCircle } from "react-icons/fi";
import { useActiveActivity } from "./quest-terminal/use-active-activity";
import { useQuestCommands } from "./quest-terminal/use-quest-commands";

export type ConversationId = "recent" | "activity" | "guild" | "world";
export type ChatContext = "contacts" | "guild";

const ChatConversationContext = createContext<{
  conversation: ConversationId;
  setConversation: (conversation: ConversationId) => void;
  chatContext: ChatContext;
  setChatContext: (context: ChatContext) => void;
} | null>(null);

export function ChatConversationProvider({ children }: { children: ReactNode }) {
  const [chatContext, setChatContext] = useState<ChatContext>("contacts");
  const [contactConversation, setContactConversation] = useState<Exclude<ConversationId, "guild">>("recent");
  const conversation = chatContext === "guild" ? "guild" : contactConversation;
  const setConversation = (nextConversation: ConversationId) => {
    if (nextConversation === "guild") setChatContext("guild");
    else {
      setContactConversation(nextConversation);
      setChatContext("contacts");
    }
  };
  return <ChatConversationContext.Provider value={{ chatContext, conversation, setChatContext, setConversation }}>{children}</ChatConversationContext.Provider>;
}

export function useChatConversation() {
  const context = useContext(ChatConversationContext);
  if (!context) throw new Error("useChatConversation must be used within ChatConversationProvider");
  return context;
}

export function useChatConversations() {
  const { activeActivity } = useActiveActivity();
  const { commands } = useQuestCommands();
  const chatMessages = commands.filter((command) => command.type === "chat-message");
  return [
    { id: "recent", title: "Recent chat", description: chatMessages.length ? `${chatMessages.length} messages` : "No messages yet" },
    { id: "activity", title: "Current activity", description: activeActivity?.name === "Current activity" ? "Task conversations" : activeActivity?.name ?? "No active activity" },
    { id: "guild", title: "Guild", description: "Guild conversations" },
    { id: "world", title: "World", description: "World conversations" },
  ] as const;
}

export function ChatConversationPicker({ chatContext, onSelect }: { chatContext?: ChatContext; onSelect?: () => void }) {
  const { conversation, setConversation } = useChatConversation();
  const conversations = useChatConversations();
  const visibleConversations = chatContext === "guild"
    ? conversations.filter((option) => option.id === "guild")
    : chatContext === "contacts"
      ? conversations.filter((option) => option.id !== "guild")
      : conversations;
  return (
    <ul aria-label="Chat conversations" className="p-2">
      {visibleConversations.map((option) => (
        <li key={option.id}>
          <button
            aria-pressed={conversation === option.id}
            className={`flex w-full cursor-pointer items-center gap-3 rounded-2xl px-3 py-3 text-left transition-colors hover:bg-white/[0.08] focus-visible:outline focus-visible:outline-1 focus-visible:outline-white ${conversation === option.id ? "bg-white/[0.1] text-white" : "text-white/75"}`}
            onClick={() => { setConversation(option.id); onSelect?.(); }}
            type="button"
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white/10"><FiMessageCircle aria-hidden="true" className="size-4" /></span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm">{option.title}</span>
              <span className="mt-0.5 block truncate text-xs text-white/40">{option.description}</span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
