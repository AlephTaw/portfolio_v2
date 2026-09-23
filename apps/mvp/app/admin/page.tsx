import type { Metadata } from "next";
import Link from "next/link";
import { FiArrowLeft, FiLogOut } from "react-icons/fi";
import portrait from "../../../agent/public/assets/live-stats-profile.png";
import { IntegrationsSection, ProfileSection } from "../components/admin";

export const metadata: Metadata = {
  title: "Admin | Speedrun IRL",
  description: "Manage account and game workspace settings.",
};

export default function AdminPage() {
  return (
    <main className="flex min-h-dvh flex-col bg-background text-foreground">
      <header className="flex h-16 shrink-0 items-center justify-between px-[clamp(1.5rem,4.4vw,3.5rem)]">
        <span className="font-mono text-[0.625rem] uppercase tracking-[0.2em] text-white/70">
          APP VERSION 0.1.0
        </span>
        <div className="flex items-center gap-4">
        <Link
          className="inline-flex items-center gap-2 text-[0.625rem] font-semibold uppercase tracking-[0.1em] text-white transition-opacity hover:opacity-60 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-white"
          href="/"
        >
          <FiLogOut aria-hidden="true" className="size-4" />
          Logout
        </Link>
        <Link
          className="inline-flex items-center gap-2 text-[0.625rem] font-semibold uppercase tracking-[0.1em] text-white transition-opacity hover:opacity-60 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-white"
          href="/stats"
        >
          <FiArrowLeft aria-hidden="true" className="size-4" />
          Back
        </Link>
        </div>
      </header>

      <section className="mx-auto w-full max-w-[72rem] flex-1 px-[clamp(1.5rem,4.4vw,3.5rem)] pb-24 pt-8">
        <div className="mx-auto mb-10 size-24 overflow-hidden rounded-full border border-white/25 bg-white/5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt="Steven Wilcox profile" className="size-full object-cover" src={portrait.src} />
        </div>
        <ProfileSection />
        <IntegrationsSection />
      </section>
    </main>
  );
}
