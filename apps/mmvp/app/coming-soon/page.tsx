import type { Metadata } from "next";
import Link from "next/link";
import { SiDiscord, SiInstagram, SiTiktok, SiYoutube } from "react-icons/si";
import { Countdown } from "./Countdown";

const socialLinks = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/",
    Icon: SiInstagram,
  },
  { label: "TikTok", href: "https://www.tiktok.com/", Icon: SiTiktok },
  { label: "YouTube", href: "https://www.youtube.com/", Icon: SiYoutube },
  { label: "Discord", href: "https://discord.com/", Icon: SiDiscord },
];

export const metadata: Metadata = {
  title: "Coming Soon | Speedrun IRL",
  description: "Speedrun IRL is coming soon.",
};

export default function ComingSoonPage() {
  return (
    <main className="flex min-h-dvh flex-col bg-background text-foreground">
      <header className="flex h-16 shrink-0 items-center justify-between px-[clamp(1.5rem,4.4vw,3.5rem)]">
        <span className="font-mono text-[0.625rem] uppercase tracking-[0.2em] text-white/70">
          Version 0.1.0
        </span>
        <Link
          className="text-xs uppercase tracking-[0.04em] text-white transition-opacity hover:opacity-60 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-white"
          href="/"
        >
          Home
        </Link>
      </header>

      <section className="flex flex-1 items-center justify-center px-6 py-16 text-center">
        <div>
          <Countdown />
          <h1 className="mt-4 text-[clamp(3rem,9vw,7rem)] font-semibold leading-none tracking-[-0.065em]">
            Coming 12/27
          </h1>

          <div className="mt-12">
            <p className="text-sm text-white/65">Follow @speedrunirl</p>
            <nav
              aria-label="Follow Speedrun IRL"
              className="mt-5 flex flex-wrap items-start justify-center gap-8"
            >
              {socialLinks.map((social) => (
                <a
                  aria-label={social.label}
                  className="group flex min-w-0 flex-col items-center gap-2 text-white focus:outline-none"
                  href={social.href}
                  key={social.label}
                  rel="noreferrer"
                  target="_blank"
                >
                  <span className="inline-flex size-10 items-center justify-center rounded-full border border-white bg-black text-white transition-colors group-hover:bg-white group-hover:text-black group-focus-visible:bg-white group-focus-visible:text-black group-focus-visible:ring-2 group-focus-visible:ring-white group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-black">
                    <social.Icon aria-hidden="true" className="size-4" />
                  </span>
                  <span className="min-h-4 text-[0.65rem] font-medium uppercase tracking-[0.16em] opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
                    {social.label}
                  </span>
                </a>
              ))}
            </nav>
            <Link
              className="mt-8 inline-flex rounded-full border border-white px-6 py-2.5 text-xs font-medium uppercase tracking-[0.14em] text-white transition-colors hover:bg-white hover:text-black focus-visible:bg-white focus-visible:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
              href="/beta"
            >
              Become a Beta Tester!
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
