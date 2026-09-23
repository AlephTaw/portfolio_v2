"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { FiFileText, FiSettings } from "react-icons/fi";
import { SurrogateTelemetryView } from "./SurrogateTelemetryView";
import { AccountSettings } from "./character-sheet/AccountSettings";

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
  characterSheetOpen,
  mapOpen,
  onCharacterSheetClick,
  onMapClick,
}: {
  characterSheetOpen: boolean;
  mapOpen: boolean;
  onCharacterSheetClick: () => void;
  onMapClick: () => void;
}) {
  return (
    <nav
      aria-label="Agent views"
      className="relative z-[9999] flex flex-col items-center gap-3 isolate"
    >
      <button
        aria-expanded={characterSheetOpen}
        aria-label={characterSheetOpen ? "Close character sheet" : "Open character sheet"}
        className={`grid size-9 place-items-center focus:outline-none focus-visible:ring-1 focus-visible:ring-black ${
          characterSheetOpen ? "bg-black" : "bg-background"
        }`}
        onClick={onCharacterSheetClick}
        title="Character sheet"
        type="button"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt=""
          aria-hidden="true"
          className={`h-5 w-auto ${characterSheetOpen ? "invert" : ""}`}
          src="/character-sheet.svg"
        />
      </button>
      <MinimapTile onClick={onMapClick} open={mapOpen} />
    </nav>
  );
}

function CharacterSheetSurface() {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <section
      aria-label="Character sheet view"
      className="character-sheet-surface composer-rail-modal pane-scroll fixed z-[10004] -translate-x-1/2 overflow-y-auto overscroll-contain bg-background px-8 py-8 text-[#191714] sm:px-10"
      data-lenis-prevent
    >
      <header className="mb-6 flex justify-end">
        <button
          aria-pressed={settingsOpen}
          aria-label={settingsOpen ? "Return to character sheet" : "Open account and settings"}
          className="inline-flex items-center gap-2 bg-background text-[0.5rem] font-semibold uppercase tracking-[0.14em] text-black focus:outline-none focus-visible:ring-1 focus-visible:ring-black"
          onClick={() => setSettingsOpen((open) => !open)}
          type="button"
        >
          {settingsOpen ? (
            <FiFileText aria-hidden="true" className="size-4" />
          ) : (
            <FiSettings aria-hidden="true" className="size-4" />
          )}
          {settingsOpen ? "Character Sheet" : "Account and Settings"}
        </button>
      </header>
      {settingsOpen ? <AccountSettings /> : <SurrogateTelemetryView />}
    </section>
  );
}

function CampaignMapModal() {
  return (
    <div
      aria-label="Campaign map"
      aria-modal="true"
      className="pointer-events-none fixed inset-0 z-[10004] grid place-items-center overflow-hidden p-4"
      role="dialog"
    >
      <Image
        alt="Colorful brain network visualization"
        className="pointer-events-none absolute right-3 z-20 h-auto w-[clamp(7rem,22vw,18rem)] object-contain sm:right-4"
        height={1338}
        priority
        src="/cognitive-network-map.png"
        style={{ top: "var(--activity-surface-bottom, 0.75rem)" }}
        unoptimized
        width={1330}
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-[var(--composer-dock-offset,6.5rem)] z-10 grid place-items-center overflow-hidden"
        style={{ top: "0px" }}
      >
        <Image
          alt="Isometric city map"
          className="minimap-rail-content h-auto max-h-full object-contain"
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
  fixed = false,
}: {
  fixed?: boolean;
}) {
  const [characterSheetOpen, setCharacterSheetOpen] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);

  useEffect(() => {
    if (!mapOpen && !characterSheetOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (mapOpen) setMapOpen(false);
      else setCharacterSheetOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [characterSheetOpen, mapOpen]);

  const mapModal = mapOpen ? <CampaignMapModal /> : null;
  const characterSheetSurface = characterSheetOpen ? <CharacterSheetSurface /> : null;

  if (fixed) {
    return (
      <>
        {characterSheetSurface}
        {mapModal}
        <div className="pointer-events-none fixed inset-x-0 bottom-[calc(var(--composer-dock-offset,6.5rem)+1rem)] z-[10006] mx-auto h-0 w-full max-w-5xl isolate">
          <div className="pointer-events-auto absolute bottom-0 right-2 w-fit sm:right-4">
            <RailContents
              characterSheetOpen={characterSheetOpen}
              mapOpen={mapOpen}
              onCharacterSheetClick={() => {
                setMapOpen(false);
                setCharacterSheetOpen((open) => !open);
              }}
              onMapClick={() => {
                setCharacterSheetOpen(false);
                setMapOpen((open) => !open);
              }}
            />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {characterSheetSurface}
      {mapModal}
      <div className="absolute bottom-3 right-2 z-[10006] isolate sm:right-4">
        <RailContents
          characterSheetOpen={characterSheetOpen}
          mapOpen={mapOpen}
          onCharacterSheetClick={() => {
            setMapOpen(false);
            setCharacterSheetOpen((open) => !open);
          }}
          onMapClick={() => {
            setCharacterSheetOpen(false);
            setMapOpen((open) => !open);
          }}
        />
      </div>
    </>
  );
}
