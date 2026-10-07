"use client";

import { VisorControl } from "./visor-control";
import { useWatcher } from "../../watcher/watcher";

export function RightSideRail({ hudActive, onToggleHud, buildActive, onResize, visiblePercent }: { hudActive: boolean; onToggleHud: () => void; buildActive: boolean; onResize: (delta: number) => void; visiblePercent: number }) {
  const { gameDesignOpen, setGameDesignOpen } = useWatcher();
  return <aside aria-label="Display controls" className="actions-side-rail absolute bottom-[calc(100%+0.5rem)] z-40 flex flex-col items-center gap-2">
    {buildActive && <button type="button" aria-label={gameDesignOpen ? "Return to panels" : "Open game design"} title={gameDesignOpen ? "Return to panels" : "Game design"} aria-pressed={gameDesignOpen} onClick={() => setGameDesignOpen((previous) => !previous)} className="grid h-12 w-12 touch-manipulation place-items-center text-white/80 hover:text-white">
      <span className="grid h-9 w-9 place-items-center rounded-full bg-gray-400/30 backdrop-blur-md">
        <span aria-hidden="true" className={`${gameDesignOpen ? "h-7 w-7" : "h-8 w-8"} bg-current`} style={{ mask: `url('/icons/${gameDesignOpen ? "comic-panels" : "game-design"}.svg?v=2') center / contain no-repeat`, WebkitMask: `url('/icons/${gameDesignOpen ? "comic-panels" : "game-design"}.svg?v=2') center / contain no-repeat` }} />
      </span>
    </button>}
    <VisorControl open={hudActive} visiblePercent={visiblePercent} onToggle={onToggleHud} onResize={onResize} />
  </aside>;
}
