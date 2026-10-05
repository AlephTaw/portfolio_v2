"use client";
export function BottomNavigation({ onFocusInput }: { onFocusInput: () => void }) {
  return <nav aria-label="Main navigation" className="actions-icon-dock grid grid-cols-5 items-center px-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2 sm:mx-auto sm:mb-3 sm:w-[320px] sm:rounded-xl">
    {[1, 2].map((slot) => <Placeholder key={slot} slot={slot} />)}
    <button type="button" aria-label="New action" onClick={onFocusInput} className="actions-create-button mx-auto grid h-11 w-11 touch-manipulation place-items-center rounded-full text-white">
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
    </button>
    {[3, 4].map((slot) => <Placeholder key={slot} slot={slot} />)}
  </nav>;
}
function Placeholder({ slot }: { slot: number }) {
  return <button type="button" disabled aria-label={"Navigation slot " + slot + " — coming soon"} className="flex min-h-11 min-w-0 flex-col items-center justify-center gap-1 text-white/35">
    <span aria-hidden="true" className="h-4 w-4 rounded-[4px] border border-current" />
    <span className="text-[9px]">Slot {slot}</span>
  </button>;
}
