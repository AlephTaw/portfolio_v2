export function TerminalTimelineRail() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-y-4 left-2 z-0 sm:left-4"
    >
      <div
        className="h-full w-0.5"
        style={{
          backgroundImage: "radial-gradient(circle, #7f7f7f 1px, transparent 1.25px)",
          backgroundRepeat: "repeat-y",
          backgroundSize: "2px 9px",
        }}
      />
    </div>
  );
}
