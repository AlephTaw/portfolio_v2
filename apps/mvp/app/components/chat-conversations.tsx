"use client";

import { createContext, useContext, useEffect, useState, type FormEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { FiMessageCircle, FiPlus, FiUsers, FiX } from "react-icons/fi";
import { demoAccount, demoConversations, demoGroups, getChatMessages } from "./chat-demo-data";
import { useQuestCommands } from "./quest-terminal/use-quest-commands";

export type ConversationId = "recent" | "history" | "guild" | "world" | `group:${string}` | `dm:${string}` | `guild:${string}`;
export type ChatContext = "contacts" | "guild";
export type ChatGroup = { id: `group:${string}`; title: string; members: string[] };

const groupStorageKey = "speedrun-irl:chat-groups";
const groupUpdateEvent = "speedrun-irl:chat-groups-updated";

function readGroups(): ChatGroup[] {
  const examples: ChatGroup[] = demoGroups.map((group) => ({ ...group, members: [...group.members] }));
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(groupStorageKey) ?? "[]");
    if (!Array.isArray(parsed)) return examples;
    const saved = parsed.filter((group): group is ChatGroup =>
      typeof group === "object" && group !== null && typeof group.id === "string" && group.id.startsWith("group:") &&
      typeof group.title === "string" && Array.isArray(group.members) && group.members.every((member: unknown) => typeof member === "string"),
    );
    return [...examples.filter((example) => !saved.some((group) => group.id === example.id)), ...saved];
  } catch {
    return examples;
  }
}

const ChatConversationContext = createContext<{
  conversation: ConversationId;
  setConversation: (conversation: ConversationId) => void;
  chatContext: ChatContext;
  setChatContext: (context: ChatContext) => void;
  threadOpen: boolean;
  setThreadOpen: (open: boolean) => void;
  groups: ChatGroup[];
  readConversations: ConversationId[];
  createGroup: (title: string, members: string[]) => void;
  updateGroup: (id: string, title: string, members: string[]) => void;
} | null>(null);

export function ChatConversationProvider({ children }: { children: ReactNode }) {
  const [chatContext, setChatContext] = useState<ChatContext>("contacts");
  const [threadOpen, setThreadOpen] = useState(false);
  const [contactConversation, setContactConversation] = useState<ConversationId>("dm:raphaelin");
  const [guildConversation, setGuildConversation] = useState<ConversationId>("guild");
  const [readConversations, setReadConversations] = useState<ConversationId[]>([]);
  const [groups, setGroups] = useState<ChatGroup[]>(() => demoGroups.map((group) => ({ ...group, members: [...group.members] })));
  useEffect(() => {
    const sync = () => setGroups(readGroups());
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener(groupUpdateEvent, sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(groupUpdateEvent, sync);
    };
  }, []);
  const saveGroups = (nextGroups: ChatGroup[]) => {
    window.localStorage.setItem(groupStorageKey, JSON.stringify(nextGroups));
    setGroups(nextGroups);
    window.dispatchEvent(new Event(groupUpdateEvent));
  };
  const createGroup = (title: string, members: string[]) => {
    const id = `group:${crypto.randomUUID()}` as const;
    saveGroups([...readGroups(), { id, title, members }]);
    setContactConversation(id);
    setChatContext("contacts");
  };
  const updateGroup = (id: string, title: string, members: string[]) => {
    saveGroups(readGroups().map((group) => group.id === id ? { ...group, title, members } : group));
  };
  const conversation = chatContext === "guild" ? guildConversation : contactConversation;
  const setConversation = (nextConversation: ConversationId) => {
    setReadConversations((current) => current.includes(nextConversation) ? current : [...current, nextConversation]);
    if (nextConversation === "guild" || nextConversation.startsWith("guild:")) {
      setGuildConversation(nextConversation);
      setChatContext("guild");
    }
    else {
      setContactConversation(nextConversation);
      setChatContext("contacts");
    }
  };
  return <ChatConversationContext.Provider value={{ chatContext, conversation, setChatContext, setConversation, threadOpen, setThreadOpen, groups, createGroup, updateGroup, readConversations }}>{children}</ChatConversationContext.Provider>;
}

export function useChatConversation() {
  const context = useContext(ChatConversationContext);
  if (!context) throw new Error("useChatConversation must be used within ChatConversationProvider");
  return context;
}

export function useChatConversations(): { id: ConversationId; title: string; description: string; context: ChatContext; isGroup?: boolean; unread?: number }[] {
  const { commands } = useQuestCommands();
  const { groups, readConversations } = useChatConversation();
  const chatMessages = getChatMessages(commands, "history");
  const builtInConversations = demoConversations.map((option) => ({
    ...option,
    id: option.id as ConversationId,
    description: option.id === "history" ? `${chatMessages.length} messages` : getChatMessages(commands, option.id).at(-1)?.text ?? option.description,
    unread: readConversations.includes(option.id as ConversationId) ? undefined : option.unread,
  }));
  return [
    ...builtInConversations.filter((option) => option.kind !== "overview"),
    ...groups.map((group) => ({ id: group.id, title: group.title, description: getChatMessages(commands, group.id).at(-1)?.text ?? `${group.members.length} ${group.members.length === 1 ? "member" : "members"}`, context: "contacts" as const, isGroup: true, unread: group.id === "group:demo-build-crew" && !readConversations.includes(group.id) ? 1 : undefined })),
    ...builtInConversations.filter((option) => option.kind === "overview"),
  ];
}

export function ChatGroupEditor({ group, onClose, onSaved }: { group?: ChatGroup; onClose: () => void; onSaved?: () => void }) {
  const { createGroup, updateGroup } = useChatConversation();
  const [title, setTitle] = useState(group?.title ?? "");
  const [members, setMembers] = useState(group?.members.join(", ") ?? "");
  useEffect(() => {
    const dismiss = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", dismiss);
    return () => window.removeEventListener("keydown", dismiss);
  }, [onClose]);
  const parsedMembers = [...new Set(members.split(",").map((member) => member.trim()).filter(Boolean))];
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = title.trim();
    if (!name || parsedMembers.length === 0) return;
    if (group) updateGroup(group.id, name, parsedMembers);
    else createGroup(name, parsedMembers);
    onClose();
    onSaved?.();
  };
  return createPortal(
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/75 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <form aria-label={group ? "Edit group chat" : "Create group chat"} aria-modal="true" className="w-full max-w-sm rounded-2xl border border-white/20 bg-[#111] p-5 text-white shadow-2xl" onSubmit={submit} role="dialog">
        <div className="mb-5 flex items-center justify-between"><h2 className="text-base font-medium">{group ? "Edit group" : "New group chat"}</h2><button aria-label="Close" className="rounded-full p-2 text-white/60 hover:bg-white/10 hover:text-white" onClick={onClose} type="button"><FiX /></button></div>
        <label className="mb-4 block text-xs text-white/60">Group name<input autoFocus className="mt-2 w-full rounded-xl border border-white/20 bg-black px-3 py-2.5 text-sm text-white outline-none focus:border-white/60" maxLength={80} onChange={(event) => setTitle(event.target.value)} placeholder="Give this group a name" required value={title} /></label>
        <label className="block text-xs text-white/60">Members<input className="mt-2 w-full rounded-xl border border-white/20 bg-black px-3 py-2.5 text-sm text-white outline-none focus:border-white/60" onChange={(event) => setMembers(event.target.value)} placeholder="Names, separated by commas" required value={members} /></label>
        <p className="mt-2 text-xs text-white/40">Enter names separated by commas. Member accounts aren’t connected yet.</p>
        <button className="mt-6 w-full rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-black disabled:opacity-40" disabled={!title.trim() || parsedMembers.length === 0} type="submit">{group ? "Save changes" : "Create group"}</button>
      </form>
    </div>,
    document.body,
  );
}

export function ChatConversationPicker({ chatContext, onSelect, showAccount = true, showNewGroup = true, edgeToEdge = false }: { chatContext?: ChatContext; onSelect?: () => void; showAccount?: boolean; showNewGroup?: boolean; edgeToEdge?: boolean }) {
  const { conversation, setConversation } = useChatConversation();
  const conversations = useChatConversations();
  const [creatingGroup, setCreatingGroup] = useState(false);
  const visibleConversations = chatContext ? conversations.filter((option) => option.context === chatContext) : conversations;
  return (
    <div className={edgeToEdge ? "w-full" : "p-2"}>
      {showAccount && <div className="mb-2 flex items-center gap-2 px-3 py-2"><span className="grid size-7 shrink-0 place-items-center rounded-full bg-white/15 text-[0.6rem] font-semibold">{demoAccount.initials}</span><span className="min-w-0 truncate text-xs text-white/55">{demoAccount.name} · Demo account</span></div>}
      {showNewGroup && chatContext !== "guild" && <button className="mb-1 flex w-full cursor-pointer items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm text-white/70 transition-colors hover:bg-white/[0.08] hover:text-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-white" onClick={() => setCreatingGroup(true)} type="button"><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white/10"><FiPlus aria-hidden="true" className="size-4" /></span>New group chat</button>}
      <ul aria-label="Chat conversations">
      {visibleConversations.map((option) => (
        <li key={option.id}>
          <button
            aria-pressed={conversation === option.id}
            className={`group flex w-full cursor-pointer items-center gap-3 py-3 text-left transition-colors hover:bg-white/[0.08] focus-visible:outline focus-visible:outline-1 focus-visible:outline-white ${edgeToEdge ? "rounded-none px-0" : "rounded-2xl px-3"} ${conversation === option.id ? "bg-white/[0.1] text-white" : "text-white/75"}`}
            onClick={() => { setConversation(option.id); onSelect?.(); }}
            type="button"
          >
            <span className={`grid size-9 shrink-0 place-items-center rounded-xl transition-colors group-hover:bg-transparent ${conversation === option.id ? "bg-transparent" : "bg-white/10"}`}>{"isGroup" in option && option.isGroup ? <FiUsers aria-hidden="true" className="size-4" /> : <FiMessageCircle aria-hidden="true" className="size-4" />}</span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center justify-between gap-2"><span className="truncate text-sm">{option.title}</span>{option.unread ? <span aria-label={`${option.unread} unread messages`} className={`grid min-w-5 shrink-0 place-items-center rounded-full bg-white px-1 text-[0.65rem] font-semibold text-black ${edgeToEdge ? "mr-4" : ""}`}>{option.unread}</span> : null}</span>
              <span className="mt-0.5 block truncate text-xs text-white/40">{option.description}</span>
            </span>
          </button>
        </li>
      ))}
      </ul>
      {creatingGroup && <ChatGroupEditor onClose={() => setCreatingGroup(false)} onSaved={onSelect} />}
    </div>
  );
}
