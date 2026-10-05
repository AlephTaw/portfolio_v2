const activity = [
  { name: "Raphael", message: "sent you a message: Ready for the next step?", time: "Now", unread: true },
  { name: "Alex Morgan", message: "reacted to your story!", time: "Now", unread: true },
  { name: "Maya", message: "reacted to your story!", time: "Now", unread: true },
  { name: "Crucible Guild", message: "shared a new daily challenge.", time: "2 hours ago", unread: true },
  { name: "Jordan", message: "sent you a message: Nice progress today.", time: "Yesterday", unread: false },
  { name: "Sam", message: "reacted to your story!", time: "2 days ago", unread: false },
  { name: "Family", message: "checked in: How was your day?", time: "2 days ago", unread: false },
  { name: "Noah", message: "reacted to your story!", time: "2 days ago", unread: false },
  { name: "Elena", message: "shared an update with you.", time: "3 days ago", unread: false },
];

export function ChatView() {
  return <div className="view-glass min-h-full text-white">
      <header className="flex h-11 items-center px-4">
        <ComponentHeading target="chat" />
      </header>
      <ComponentSystems target="chat" />
      <ul aria-label="Chat activity" className="space-y-0.5">
        {activity.map((item, index) => <li key={item.name} className="relative flex min-h-16 items-center gap-3 px-4 py-2">
          {item.unread && <span aria-label="Unread" className="absolute inset-y-2 left-0 w-[3px] bg-[var(--app-accent)]" />}
          <span aria-hidden="true" className="h-10 w-10 shrink-0 rounded-full bg-[#242329]" style={{
            backgroundImage: "url('/build-toon-covers-v4.png')",
            backgroundSize: "300% auto",
            backgroundPosition: `${(index % 3) * 50}% 22%`,
            backgroundRepeat: "no-repeat",
          }} />
          <div className="min-w-0">
            <p className="text-[13px] leading-[18px] text-white/85"><span className="font-semibold">{item.name}</span>{" "}{item.message}</p>
            <p className="mt-0.5 text-[11px] leading-4 text-white/45">{item.time}</p>
          </div>
        </li>)}
      </ul>
  </div>;
}
import { ComponentHeading, ComponentSystems } from "../settings/component-systems";
