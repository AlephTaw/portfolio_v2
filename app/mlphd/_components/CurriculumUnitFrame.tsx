import type { CurriculumUnit } from "../../lib/curriculum";

export function CurriculumUnitFrame({ unit }: { unit: CurriculumUnit }) {
  return (
    <article className="min-w-0 bg-background px-0 sm:px-2">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3 border-b border-[#d8d0c1] pb-4">
        <div>
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-[#8D7A70]">
            Interactive Unit
          </p>
          <h2 className="mt-2 text-xl font-light text-[#191714]">{unit.title}</h2>
        </div>
        <p className="text-[0.62rem] font-medium uppercase tracking-[0.18em] text-[#766b5d]">
          {unit.difficulty}
        </p>
      </div>

      <iframe
        className="min-h-[72vh] w-full border-0 bg-background"
        key={unit.id}
        loading="eager"
        sandbox="allow-scripts"
        src={unit.outputPath}
        title={`${unit.title} interactive notebook`}
      />
    </article>
  );
}
