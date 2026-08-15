import Link from "next/link";
import type { ReactNode } from "react";

export function CharacterSheetSectionPage({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <main className="min-h-screen bg-background px-5 py-8 text-[#191919] sm:px-8 lg:px-10">
      <div className="mx-auto w-full max-w-3xl">
        <Link
          className="text-xs font-semibold uppercase tracking-[0.32em] text-[#766b5d] transition-colors hover:text-black focus:outline-none focus-visible:text-black focus-visible:underline"
          href="/?view=character-sheet"
        >
          Back
        </Link>
        <div className="mx-auto mt-8 w-full max-w-xl">
          <section
            aria-label={title}
            className="min-w-0 [&>:first-child]:!mt-0"
          >
            {children}
          </section>
        </div>
      </div>
    </main>
  );
}
