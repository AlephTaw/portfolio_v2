"use client";

import Image from "next/image";
import { ChatConversationPicker, useChatConversation, useChatConversations } from "../components/chat-conversations";
import { PinScrollArea } from "../components/pin-scroll-area";
import { useQuestCommands } from "../components/quest-terminal/use-quest-commands";

const watchFaceMask = "radial-gradient(ellipse 2.45% 0.95% at 74.1% 37.05%, transparent 90%, black 100%)";

export default function ChatPage() {
  const { chatContext, conversation, setChatContext } = useChatConversation();
  const conversations = useChatConversations();
  const { commands } = useQuestCommands();
  const messages = commands.filter((command) => command.type === "chat-message" && (conversation === "recent" || command.conversationId === conversation));
  const title = conversations.find((option) => option.id === conversation)?.title ?? "Chat";

  return (
    <main className="h-full min-h-0 overflow-hidden bg-black text-white">
      <div className="mx-auto flex h-full min-h-0 w-full max-w-[72rem] flex-col pl-[clamp(1.5rem,4.4vw,3.5rem)] pr-[clamp(5rem,10vw,7rem)] pb-[calc(var(--composer-height)+0.75rem)] pt-6">
        <header className="shrink-0 border-b border-white/15 pb-5"><h1 className="text-xl font-medium">Chat</h1><p className="mt-1 text-sm text-white/45">{chatContext === "guild" ? "Guild" : "Contacts"}</p></header>
        <div className="grid min-h-0 flex-1 grid-rows-[minmax(0,1fr)_minmax(0,1fr)] gap-6 pt-5 md:grid-cols-[minmax(14rem,20rem)_minmax(0,1fr)] md:grid-rows-1">
          <section aria-label={`${chatContext === "guild" ? "Guild" : "Contacts"} conversations`} className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-white/15">
            <PinScrollArea wrapperClassName="min-h-0 flex-1"><ChatConversationPicker chatContext={chatContext} /></PinScrollArea>
            <nav aria-label="Chat contexts" className="flex shrink-0 gap-5 border-t border-white/15 px-5 py-4">
              {(["contacts", "guild"] as const).map((context) => (
                <button
                  aria-pressed={chatContext === context}
                  className={`cursor-pointer text-sm transition-colors hover:text-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white ${chatContext === context ? "text-white" : "text-white/45"}`}
                  key={context}
                  onClick={() => setChatContext(context)}
                  type="button"
                >
                  {context === "contacts" ? "Contacts" : "Guild"}
                </button>
              ))}
            </nav>
          </section>
          <section aria-label={title} className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-white/15">
            <div className="flex shrink-0 items-center justify-between gap-4 border-b border-white/10 px-5 py-3">
              <h2 className="text-sm font-medium">{title}</h2>
              <Image alt="Stick figure holding a book" className="h-[3.75rem] w-auto shrink-0 object-contain invert sm:h-[5.25rem]" height={1536} src="/chat-reader-figure.png" style={{ maskImage: watchFaceMask, WebkitMaskImage: watchFaceMask }} width={1024} />
            </div>
            <PinScrollArea wrapperClassName="min-h-0 flex-1" className="p-5">
              {messages.length ? <ol className="space-y-4">{messages.map((message, index) => <li className="ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-white/[0.09] px-4 py-3" key={`${message.executedAt ?? index}-${index}`}><p className="whitespace-pre-wrap break-words text-sm leading-6">{message.item}</p></li>)}</ol> : <p className="py-12 text-center text-sm text-white/40">No messages yet</p>}
            </PinScrollArea>
          </section>
        </div>
      </div>
    </main>
  );
}
