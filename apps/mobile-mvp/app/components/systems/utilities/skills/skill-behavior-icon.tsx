export function SkillBehaviorIcon({ id, color, large = false }: { id: string; color: string; large?: boolean }) {
  return <svg aria-hidden="true" viewBox="0 0 40 40" className={`${large ? "h-10 w-10" : "h-7 w-7"} shrink-0`} style={{ color }} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    {id === "meal-prep-behavior" && <>
      <path d="M25 24c-5-9 1-17 11-18 2 10-2 18-11 18Z" fill="currentColor" fillOpacity=".18" />
      <path d="m23 27 9-16m-4 6 4 1m-6 3-1-4" />
      <path d="M20 16c7 0 10 5 9 11-1 6-6 9-12 9S6 33 5 27c-1-6 2-11 9-11" fill="currentColor" fillOpacity=".25" />
      <path d="m17 17-6-3 6 1 3-5-1 6 5-1-5 3m-2-3-1-5" />
    </>}
    {id === "fitness-behavior" && <>
      <path d="M12 20h16M4 16v8m32-8v8" strokeWidth="2.5" />
      <rect x="7" y="10" width="5" height="20" rx="1.5" fill="currentColor" fillOpacity=".25" />
      <rect x="28" y="10" width="5" height="20" rx="1.5" fill="currentColor" fillOpacity=".25" />
    </>}
    {id === "sleep-behavior" && <>
      <path d="M11 30v5m13-5v5M9 18c-2-5 4-8 7-5 2-5 8-4 9 0 5-1 8 4 5 7 2 5-2 9-6 8-3 4-8 4-10 1-5 1-9-4-5-7-3 0-3-4 0-4Z" fill="currentColor" fillOpacity=".18" />
      <path d="M8 19c-5-4-7 0-5 3m25-3c-1-3 4-5 6-2l3 5-3 6h-5Z" fill="currentColor" fillOpacity=".25" />
      <path d="m31 22 2 1M22 4h4l-4 5h4m4-7h6l-6 7h6" />
    </>}
    {id === "fabio-behavior" && <>
      <path d="M20 4C8 0 3 11 5 20c-4 5-3 12 1 15 4 3 8 2 10-1-6-4-6-13-3-19 1 4 5 5 9 5-3-3-4-6-2-9 5 4 8 8 8 14 0 4-2 7-4 9 6 5 15 2 14-5 0-4-4-6-3-11C36 7 27 1 20 4Z" fill="currentColor" stroke="none" />
      <path d="M14 22v4c0 5 3 8 6 8s6-3 6-8v-3m-9 2h1m4 0h1m-5 4h4" />
    </>}
    {id === "baby-face-behavior" && <>
      <path d="M8 21c-5-3-7 5-2 7h3m22-7c5-3 7 5 2 7h-3" />
      <path d="M20 9C4 9 5 35 20 35S36 9 20 9Z" fill="currentColor" fillOpacity=".18" />
      <path d="M19 11c-5-5-1-10 3-7 4 4-1 8-4 5m-4 14h1m10 0h1m-10 6c2 2 6 2 8 0" />
    </>}
  </svg>;
}
