"use client";

import { useState } from "react";
import { FiArrowLeft, FiEdit2, FiPlus } from "react-icons/fi";
import { chatContexts, ChatConversationPicker, ChatGroupEditor, useChatConversation, useChatConversations } from "./chat-conversations";
import { demoConversations, formatChatTime, getChatMessages } from "./chat-demo-data";
import { PinScrollArea } from "./pin-scroll-area";
import { useQuestCommands } from "./quest-terminal/use-quest-commands";

export function InteractionsApp({ embedded = false }: { embedded?: boolean }) {
  const { chatContext, conversation, groups, setChatContext, threadOpen, setThreadOpen } = useChatConversation();
  const [editingGroup, setEditingGroup] = useState(false);
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [embeddedThreadOpen, setEmbeddedThreadOpen] = useState(false);
  const mobileThreadOpen = embedded ? embeddedThreadOpen : threadOpen;
  const openThread = () => embedded ? setEmbeddedThreadOpen(true) : setThreadOpen(true);
  const conversations = useChatConversations();
  const { commands } = useQuestCommands();
  const messages = getChatMessages(commands, conversation);
  const title = conversations.find((option) => option.id === conversation)?.title ?? "Chat";
  const group = groups.find((option) => option.id === conversation);
  const selectedMembers = group?.members ?? demoConversations.find((option) => option.id === conversation)?.members;

  const messageList = messages.length
    ? <ol className="space-y-5">{messages.map((message) => <li className={`flex flex-col ${message.sender === "You" ? "items-end" : "items-start"}`} key={message.id}><div className="mb-1 flex max-w-[85%] items-baseline gap-3 text-[0.65rem] text-white/45"><span>{message.sender}</span><time dateTime={message.at}>{formatChatTime(message.at)}</time></div><div className={`max-w-[85%] rounded-2xl px-4 py-3 ${message.sender === "You" ? "rounded-br-sm bg-white/[0.14]" : "rounded-bl-sm bg-white/[0.07]"}`}><p className="whitespace-pre-wrap break-words text-sm leading-6">{message.text}</p></div></li>)}</ol>
    : <p className="py-12 text-center text-sm text-white/40">No messages yet</p>;

  return (
    <main className="h-full min-h-0 overflow-hidden bg-black text-white">
      <div className={`mx-auto flex h-full min-h-0 w-full max-w-[72rem] flex-col pl-[clamp(1.5rem,4.4vw,3.5rem)] pr-[clamp(1.5rem,4.4vw,3.5rem)] ${embedded ? "py-3" : "pb-[var(--composer-height)]"}`}>
        <div className="flex min-h-0 flex-1 flex-col md:hidden">
          <div className="flex shrink-0 items-center gap-3 py-3">
            {embedded && mobileThreadOpen && <button aria-label="Back to conversations" className="cursor-pointer rounded-full p-2 text-white/70 hover:bg-white/10 hover:text-white" onClick={() => setEmbeddedThreadOpen(false)} type="button"><FiArrowLeft aria-hidden="true" className="size-5" /></button>}
            {mobileThreadOpen ? <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{title}</p>{selectedMembers && <p className="truncate text-xs text-white/45">{selectedMembers.join(", ")}</p>}</div> : <nav aria-label="Chat contexts" className="flex min-w-0 flex-1 flex-wrap items-center gap-x-4 gap-y-2">{chatContexts.map((context) => <button aria-pressed={chatContext === context} className={`shrink-0 cursor-pointer text-xs capitalize transition-colors focus-visible:outline focus-visible:outline-1 focus-visible:outline-white sm:text-sm ${chatContext === context ? "text-white" : "text-white/45"}`} key={context} onClick={() => setChatContext(context)} type="button">{context}</button>)}</nav>}
            {mobileThreadOpen && group ? <button aria-label={`Edit ${group.title} group`} className="cursor-pointer rounded-full p-2 text-white/60 hover:bg-white/10 hover:text-white" onClick={() => setEditingGroup(true)} type="button"><FiEdit2 aria-hidden="true" className="size-4" /></button> : !mobileThreadOpen ? <button className="ml-auto flex shrink-0 cursor-pointer items-center gap-1 text-xs text-white/70 hover:text-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-white sm:text-sm" onClick={() => setCreatingGroup(true)} type="button"><FiPlus aria-hidden="true" className="size-4" /><span>New group chat</span></button> : null}
          </div>
          <section aria-label={`${chatContext} conversations`} className={mobileThreadOpen ? "hidden" : "flex min-h-0 flex-1 flex-col overflow-hidden"}>
            <PinScrollArea wrapperClassName="min-h-0 flex-1"><ChatConversationPicker chatContext={chatContext} edgeToEdge onSelect={openThread} showAccount={false} showNewGroup={false} /></PinScrollArea>
          </section>
          {mobileThreadOpen && <PinScrollArea aria-label={title} wrapperClassName="min-h-0 flex-1" className="p-2">{messageList}</PinScrollArea>}
        </div>
        <div className="hidden min-h-0 flex-1 gap-6 md:grid md:grid-cols-[minmax(14rem,20rem)_minmax(0,1fr)]">
          <section aria-label={`${chatContext} conversations`} className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-white/15">
            <PinScrollArea wrapperClassName="min-h-0 flex-1"><ChatConversationPicker chatContext={chatContext} /></PinScrollArea>
            <nav aria-label="Chat contexts" className="flex shrink-0 gap-5 border-t border-white/15 px-5 py-4">
              {chatContexts.map((context) => (
                <button
                  aria-pressed={chatContext === context}
                  className={`cursor-pointer text-sm capitalize transition-colors hover:text-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white ${chatContext === context ? "text-white" : "text-white/45"}`}
                  key={context}
                  onClick={() => setChatContext(context)}
                  type="button"
                >
                  {context}
                </button>
              ))}
            </nav>
          </section>
          <section aria-label={title} className="flex min-h-0 flex-col overflow-hidden">
            {selectedMembers && <div className="flex shrink-0 items-center justify-between gap-3 px-5 py-3"><div className="min-w-0"><h2 className="truncate text-sm font-medium">{title}</h2><p className="truncate text-xs text-white/45">{selectedMembers.join(", ")}</p></div>{group && <button aria-label={`Edit ${group.title} group`} className="shrink-0 cursor-pointer rounded-full p-2 text-white/55 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-white" onClick={() => setEditingGroup(true)} type="button"><FiEdit2 aria-hidden="true" className="size-4" /></button>}</div>}
            <PinScrollArea wrapperClassName="min-h-0 flex-1" className="p-5">
              {messageList}
            </PinScrollArea>
          </section>
        </div>
      </div>
      {editingGroup && group && <ChatGroupEditor group={group} onClose={() => setEditingGroup(false)} />}
      {creatingGroup && <ChatGroupEditor onClose={() => setCreatingGroup(false)} onSaved={openThread} />}
    </main>
  );
}
