const visionTiles = [
  {
    className: "row-span-2 bg-[#d8d0c1]",
    eyebrow: "01 · Direction",
    title: "Build a life with room to think.",
  },
  {
    className: "bg-[#b8c9c7]",
    eyebrow: "02 · Practice",
    title: "Small systems, daily.",
  },
  {
    className: "bg-[#c8b7a6]",
    eyebrow: "03 · Craft",
    title: "Make useful things.",
  },
  {
    className: "bg-[#b9c6d2]",
    eyebrow: "04 · World",
    title: "Stay curious.",
  },
  {
    className: "bg-[#d2c6a5]",
    eyebrow: "05 · Signal",
    title: "Leave clear evidence.",
  },
] as const;

export function VisionBoard() {
  return (
    <section className="mx-auto w-full max-w-xl pb-16 text-[#191919]">
      <p className="text-[0.55rem] font-semibold uppercase tracking-[0.28em] text-[#6d6d6d]">
        Campaign Vision
      </p>
      <h1 className="mt-3 text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">
        Vision Board
      </h1>
      <p className="mt-3 max-w-lg text-sm leading-6 text-[#766b5d]">
        A quiet reference point for the kind of work and life this campaign is
        building toward.
      </p>

      <div className="mt-9 border-2 border-black bg-[#191919] p-2 sm:p-3">
        <div className="grid min-h-[24rem] grid-cols-2 grid-rows-[1.2fr_0.8fr_1fr] gap-2 sm:min-h-[30rem] sm:grid-rows-[1.25fr_0.75fr_1fr]">
          {visionTiles.map((tile) => (
            <article
              className={`flex min-h-0 flex-col justify-between p-3 sm:p-5 ${tile.className}`}
              key={tile.eyebrow}
            >
              <p className="text-[0.48rem] font-semibold uppercase tracking-[0.18em] text-black/60">
                {tile.eyebrow}
              </p>
              <h2 className="max-w-[12rem] text-base font-semibold leading-tight tracking-[-0.02em] sm:text-xl">
                {tile.title}
              </h2>
            </article>
          ))}
        </div>
      </div>

      <div className="mt-8 grid gap-5 border-t border-[#d8d0c1] pt-6 sm:grid-cols-3">
        {[
          ["North star", "Useful work with a human scale."],
          ["Current season", "Learning, shipping, and paying attention."],
          ["Next signal", "A consistent week is a successful week."],
        ].map(([label, value]) => (
          <div key={label}>
            <p className="text-[0.5rem] font-semibold uppercase tracking-[0.2em] text-[#6d6d6d]">
              {label}
            </p>
            <p className="mt-2 text-sm leading-5 text-[#3f3a35]">{value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
