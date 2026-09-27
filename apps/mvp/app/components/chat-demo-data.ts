import type { QuestCommand } from "./quest-terminal/quest-terminal-data";

// Presentation-only examples. They are never written to command history or sent to an API.
export const demoAccount = { name: "Alex Morgan", handle: "@alex", initials: "AM" };

export const demoGroups = [
  { id: "group:demo-build-crew", title: "Build Crew", members: ["Maya Chen", "Leo Ortiz", "Raphaelin"] },
  { id: "group:demo-sunday-reset", title: "Sunday Reset", members: ["Nora Ellis", "Maya Chen"] },
] as const;

export type DemoConversation = {
  id: string;
  title: string;
  description: string;
  context: "contacts" | "guild";
  kind: "overview" | "direct" | "guild";
  unread?: number;
  members?: string[];
};

export const demoConversations: DemoConversation[] = [
  { id: "recent", title: "Recent chat", description: "Latest messages across conversations", context: "contacts", kind: "overview" },
  { id: "history", title: "Full Chat History", description: "Every conversation, in order", context: "contacts", kind: "overview" },
  { id: "dm:raphaelin", title: "Raphaelin", description: "Your guide", context: "contacts", kind: "direct", unread: 2 },
  { id: "dm:maya", title: "Maya Chen", description: "Design and build partner", context: "contacts", kind: "direct", unread: 1 },
  { id: "dm:leo", title: "Leo Ortiz", description: "Training partner", context: "contacts", kind: "direct" },
  { id: "world", title: "World", description: "Worldline updates", context: "contacts", kind: "direct" },
  { id: "guild", title: "Crucible Guild", description: "General guild channel", context: "guild", kind: "guild", unread: 3, members: ["Alex", "Raphaelin", "Maya", "Nora", "Leo"] },
  { id: "guild:workshop", title: "Workshop", description: "Share what you are building", context: "guild", kind: "guild", unread: 1, members: ["Alex", "Maya", "Nora", "Leo"] },
];

export type ChatDisplayMessage = {
  id: string;
  conversationId: string;
  sender: string;
  text: string;
  at: string;
  sample?: boolean;
};

const day = "2026-09-27";
const example = (id: string, conversationId: string, sender: string, text: string, time: string): ChatDisplayMessage => ({
  id,
  conversationId,
  sender,
  text,
  at: `${day}T${time}:00-04:00`,
  sample: true,
});

export const demoMessages: ChatDisplayMessage[] = [
  example("r1", "dm:raphaelin", "Raphaelin", "Morning, Alex. What would make today feel like a win?", "08:12"),
  example("r2", "dm:raphaelin", "You", "Finish the chat flow and make time for a short workout.", "08:14"),
  example("r3", "dm:raphaelin", "Raphaelin", "Good. Start with one small action for each—no need to solve the whole day at once.", "08:15"),
  example("r4", "dm:raphaelin", "Raphaelin", "Your next check-in is this evening. I can help you review what worked.", "11:42"),
  example("m1", "dm:maya", "Maya Chen", "I sketched two directions for the character navigation.", "09:06"),
  example("m2", "dm:maya", "You", "Send me the simpler one first. I want the labels to stay readable on mobile.", "09:08"),
  example("m3", "dm:maya", "Maya Chen", "Done. The reduced version keeps the figure and only reveals leader lines on hover or focus.", "09:11"),
  example("l1", "dm:leo", "Leo Ortiz", "Strength session at six? We can keep it to thirty minutes.", "10:20"),
  example("l2", "dm:leo", "You", "Yes. Squats, pushups, and mobility after.", "10:24"),
  example("w1", "world", "World", "The Workshop is open. Your current activity is ready to continue.", "08:30"),
  example("w2", "world", "You", "Show me what changed since yesterday.", "08:31"),
  example("w3", "world", "World", "Two new notes and one completed build step are waiting in your worldline.", "08:32"),
  example("b1", "group:demo-build-crew", "Maya Chen", "I pushed the first pass of the storyboard panels.", "09:31"),
  example("b2", "group:demo-build-crew", "Leo Ortiz", "The mobile layout looks much cleaner now.", "09:34"),
  example("b3", "group:demo-build-crew", "You", "Great. Let’s test the chat flow next.", "09:36"),
  example("b4", "group:demo-build-crew", "Raphaelin", "I’ll collect the rough edges as we try it.", "09:38"),
  example("s1", "group:demo-sunday-reset", "Nora Ellis", "Sunday reset: groceries, laundry, then a walk?", "10:01"),
  example("s2", "group:demo-sunday-reset", "You", "I’m in. I’ll handle groceries.", "10:05"),
  example("s3", "group:demo-sunday-reset", "Maya Chen", "Perfect. I’ll bring the meal prep list.", "10:07"),
  example("g1", "guild", "Nora Ellis", "Welcome to the Crucible Guild check-in.", "08:45"),
  example("g2", "guild", "Raphaelin", "Share one focus for today and one thing you need help with.", "08:47"),
  example("g3", "guild", "You", "Focus: finish the conversation UX. Help: a second set of eyes on mobile.", "08:51"),
  example("g4", "guild", "Maya Chen", "I can review it after lunch.", "11:17"),
  example("gw1", "guild:workshop", "Leo Ortiz", "What is everyone building this week?", "09:50"),
  example("gw2", "guild:workshop", "You", "A more useful chat page for the MVP.", "09:55"),
  example("gw3", "guild:workshop", "Nora Ellis", "Share a screenshot when the flow is ready.", "11:30"),
];

export function getChatMessages(commands: QuestCommand[], conversationId: string): ChatDisplayMessage[] {
  const enteredMessages = commands.flatMap((command, index) => command.type === "chat-message" ? [{
    id: `entered-${index}`,
    conversationId: command.conversationId ?? "recent",
    sender: "You",
    text: command.item,
    at: command.executedAt ?? new Date(0).toISOString(),
  }] : []);
  const all = [...demoMessages, ...enteredMessages].sort((a, b) => a.at.localeCompare(b.at));
  if (conversationId === "history") return all;
  if (conversationId === "recent") return all.slice(-12);
  return all.filter((message) => message.conversationId === conversationId);
}

export function formatChatTime(timestamp: string) {
  return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(new Date(timestamp));
}
