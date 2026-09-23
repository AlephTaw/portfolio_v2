"use client";

import { useRef, useState } from "react";
import { FiVolume2, FiVolumeX } from "react-icons/fi";

export function HomepageReel({ src }: { src: string }) {
  const [muted, setMuted] = useState(true);
  const hasRevealedLeaderboard = useRef(false);

  return (
    <div className="relative h-full w-full">
      <video
        aria-label="Homepage reel"
        autoPlay
        className="h-full w-full object-contain"
        loop
        muted={muted}
        onTimeUpdate={(event) => {
          if (event.currentTarget.currentTime >= 3 && !hasRevealedLeaderboard.current) {
            hasRevealedLeaderboard.current = true;
            window.dispatchEvent(new Event("mmvp:homepage-reel-reveal"));
          }
        }}
        playsInline
        src={src}
      />
      <button
        aria-label={muted ? "Unmute homepage reel" : "Mute homepage reel"}
        aria-pressed={!muted}
        className="absolute right-2 top-2 grid size-8 place-items-center bg-transparent text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        onClick={() => setMuted((current) => !current)}
        type="button"
      >
        {muted ? <FiVolumeX aria-hidden="true" className="size-4" /> : <FiVolume2 aria-hidden="true" className="size-4" />}
      </button>
    </div>
  );
}
