/** Clean vector reconstruction of the striped manga arrow reference. */
export function OnboardingArrow({ onContinue }: { onContinue: () => void }) {
  return <button type="button" aria-label="Scroll down to begin onboarding" onClick={onContinue} className="landing-onboarding-arrow absolute bottom-[max(2px,env(safe-area-inset-bottom))] left-1/2 z-10 -translate-x-1/2 p-4 text-white focus-visible:outline focus-visible:outline-white/70">
    <svg aria-hidden="true" viewBox="0 0 176 256" className="landing-onboarding-arrow-bounce h-[min(22.5vw,105px)] w-auto" fill="currentColor">
      <g transform="translate(176 0) rotate(90)">
      <rect x="0" y="40" width="6" height="96" />
      <rect x="16" y="40" width="8" height="96" />
      <rect x="34" y="40" width="10" height="96" />
      <rect x="54" y="40" width="12" height="96" />
      <rect x="76" y="40" width="14" height="96" />
      <rect x="100" y="40" width="16" height="96" />
      <path d="M126 40h34V0l96 88-96 88v-40h-34Z" />
      </g>
    </svg>
  </button>;
}
