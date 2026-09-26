import type { Metadata } from "next";
import { AdminContent } from "../components/admin";
import { PinScrollArea } from "../components/pin-scroll-area";

export const metadata: Metadata = {
  title: "Admin | Speedrun IRL",
  description: "Manage account and game workspace settings.",
};

export default function AdminPage() {
  return (
    <main className="h-full overflow-hidden bg-background text-foreground">
      <PinScrollArea className="flex flex-col" wrapperClassName="h-full">
      <section className="mx-auto w-full max-w-[72rem] flex-1 px-[clamp(1.5rem,4.4vw,3.5rem)] pb-24 pt-8">
        <AdminContent />
      </section>
      </PinScrollArea>
    </main>
  );
}
