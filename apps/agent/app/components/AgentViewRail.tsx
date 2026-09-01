"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";

function MinimapTile({ open, onClick }: { open: boolean; onClick: () => void }) {
  return (
    <button
      aria-expanded={open}
      aria-label={open ? "Close campaign map" : "Open campaign map"}
      className="grid size-9 place-items-center rounded-sm bg-white p-1 shadow-sm transition-transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
      onClick={onClick}
      type="button"
    >
      <span className="grid size-7 grid-cols-4 grid-rows-4 gap-px overflow-hidden rounded-sm border border-[#766b5d] bg-[#d8d0c1] p-0.5">
        <span className="col-span-2 row-span-2 bg-[#7c9a66]" />
        <span className="col-span-2 bg-[#b8a06d]" />
        <span className="bg-[#6e8fa0]" />
        <span className="bg-[#526b50]" />
        <span className="col-span-2 bg-[#93a870]" />
        <span className="bg-[#c4ad78]" />
        <span className="col-span-2 bg-[#617d8c]" />
        <span className="bg-[#758d59]" />
      </span>
    </button>
  );
}

function RailContents({
  direction,
  mapOpen,
  onMapClick,
  onPrimaryViewClick,
}: {
  direction: "left" | "right";
  mapOpen: boolean;
  onMapClick: () => void;
  onPrimaryViewClick: () => void;
}) {
  const pointsLeft = direction === "left";
  const ArrowIcon = pointsLeft ? FiArrowLeft : FiArrowRight;
  const label = pointsLeft ? "Open character sheet" : "Return to agent workspace";

  return (
    <nav
      aria-label="Agent views"
      className="relative z-[9999] flex flex-col items-center gap-3 isolate"
    >
      <Link
        aria-label={label}
        className="grid size-7 place-items-center rounded-sm bg-white text-black shadow-sm transition-colors hover:bg-black hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
        href={pointsLeft ? "/character-sheet" : "/"}
        onClick={onPrimaryViewClick}
        title={pointsLeft ? "Character sheet" : "Agent workspace"}
      >
        <ArrowIcon aria-hidden="true" className="size-4" />
      </Link>
      <MinimapTile onClick={onMapClick} open={mapOpen} />
    </nav>
  );
}

function CampaignMapModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      aria-label="Campaign map"
      aria-modal="true"
      className="fixed inset-0 z-[10001] grid place-items-center overflow-hidden bg-black/95 p-4"
      role="dialog"
    >
      <button
        aria-label="Close campaign map"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
        type="button"
      />
      <Image
        alt="Colorful brain network visualization"
        className="pointer-events-none absolute right-3 top-3 z-20 h-auto w-[clamp(7rem,22vw,18rem)] object-contain sm:right-4 sm:top-4"
        height={1338}
        priority
        src="/cognitive-network-map.png"
        unoptimized
        width={1330}
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 bottom-[var(--composer-dock-offset,6.5rem)] z-10 grid place-items-center overflow-hidden">
        <Image
          alt="Isometric city map"
          className="h-auto max-h-full w-[var(--composer-dock-width,100vw)] max-w-[var(--composer-dock-width,100vw)] object-contain"
          height={1500}
          priority
          src="/isometric-city.jpg"
          unoptimized
          width={2000}
        />
      </div>
    </div>
  );
}

export function AgentViewRail({
  direction,
  fixed = false,
}: {
  direction: "left" | "right";
  fixed?: boolean;
}) {
  const [mapOpen, setMapOpen] = useState(false);

  useEffect(() => {
    if (!mapOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMapOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mapOpen]);

  const mapModal = mapOpen ? <CampaignMapModal onClose={() => setMapOpen(false)} /> : null;

  if (fixed) {
    return (
      <>
        {mapModal}
        <div className="pointer-events-none fixed inset-x-0 bottom-[calc(var(--composer-dock-offset,6.5rem)+1rem)] z-[10003] mx-auto h-0 w-full max-w-5xl isolate">
          <div className="pointer-events-auto absolute bottom-0 right-2 w-fit sm:right-4">
            <RailContents
              direction={direction}
              mapOpen={mapOpen}
              onMapClick={() => setMapOpen((open) => !open)}
              onPrimaryViewClick={() => setMapOpen(false)}
            />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {mapModal}
      <div className="absolute bottom-3 right-2 z-[10003] isolate sm:right-4">
        <RailContents
          direction={direction}
          mapOpen={mapOpen}
          onMapClick={() => setMapOpen((open) => !open)}
          onPrimaryViewClick={() => setMapOpen(false)}
        />
      </div>
    </>
  );
}
