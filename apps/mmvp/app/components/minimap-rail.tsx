"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FiArrowLeft } from "react-icons/fi";
import { pageTransitionEvent, type PageTransitionDetail } from "./page-transition-events";

const WORLD_TREE_ORIGIN_KEY = "speedrun-irl:world-tree-origin";

export function MinimapRail() {
  const pathname = usePathname();
  const router = useRouter();
  const isWorldTree = pathname === "/world-tree";
  const isAdmin = pathname === "/admin";

  const prepareImmediateTransition = (to: string) => {
    const destination = new URL(to, window.location.origin);
    window.dispatchEvent(
      new CustomEvent<PageTransitionDetail>(pageTransitionEvent, {
        detail: {
          direction: 0,
          from: window.location.pathname,
          to: destination.pathname,
        },
      }),
    );
  };

  const handleMinimapClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (!isWorldTree) {
      window.sessionStorage.setItem(
        WORLD_TREE_ORIGIN_KEY,
        `${window.location.pathname}${window.location.search}`,
      );
      prepareImmediateTransition("/world-tree");
      return;
    }

    event.preventDefault();
    const storedOrigin = window.sessionStorage.getItem(WORLD_TREE_ORIGIN_KEY);
    const destination = storedOrigin?.startsWith("/") ? storedOrigin : "/stats";
    prepareImmediateTransition(destination);
    router.push(destination);
  };

  return (
    <aside
      aria-label="Map navigation"
      className="pointer-events-none fixed inset-0 z-40"
    >
      <div className="mx-auto flex h-full w-full max-w-[72rem] justify-end">
        <nav aria-label="Page navigation" className="flex h-full w-10 flex-col items-center">
          <div className="mt-auto flex flex-col items-center gap-3 pb-[4.75rem]">
            {isAdmin && (
              <Link
                aria-label="Back to stats"
                className="pointer-events-auto grid size-10 place-items-center rounded-[3px] bg-black text-white transition-colors hover:bg-white hover:text-black focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white"
                href="/stats"
              >
                <FiArrowLeft aria-hidden="true" className="size-5" />
              </Link>
            )}
            <Link
              aria-label={isWorldTree ? "Return to previous page" : "Open The World Tree"}
              className="pointer-events-auto grid size-10 place-items-center rounded-[3px] bg-black p-1 text-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white"
              href={isWorldTree ? "/stats" : "/world-tree"}
              onClick={handleMinimapClick}
            >
              <span
                aria-hidden="true"
                className="grid size-8 grid-cols-4 grid-rows-4 gap-px overflow-hidden rounded-[2px] border border-white/70 bg-white p-0.5"
              >
                <span className="col-span-2 row-span-2 bg-black" />
                <span className="col-span-2 bg-black/60" />
                <span className="bg-black/35" />
                <span className="bg-black" />
                <span className="col-span-2 bg-black/70" />
                <span className="bg-black/45" />
                <span className="col-span-2 bg-black" />
                <span className="bg-black/60" />
              </span>
            </Link>
          </div>
        </nav>
      </div>
    </aside>
  );
}
