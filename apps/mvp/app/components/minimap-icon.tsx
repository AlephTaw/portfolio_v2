export function MinimapIcon({ className = "size-10" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`grid grid-cols-4 grid-rows-4 gap-px overflow-hidden rounded-[2px] border border-white/70 bg-white p-0.5 ${className}`}
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
  );
}
