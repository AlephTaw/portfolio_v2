export function Inventory() {
  return (
    <div className="mt-9">
      <p className="w-full whitespace-nowrap text-left text-[0.5rem] font-semibold uppercase tracking-[0.1em] text-[#6d6d6d] sm:text-[0.62rem] sm:tracking-[0.2em]">
        Inventory
      </p>
      <p className="mt-3 text-right text-[0.55rem] uppercase tracking-[0.28em] text-[#7f7f7f]">
        Empty slots
      </p>
      <div className="mt-2 grid grid-cols-4 gap-x-2 gap-y-2 bg-background px-3 py-2 sm:grid-cols-8">
        {Array.from({ length: 8 }, (_, index) => (
          <div aria-hidden="true" className="flex min-w-0 justify-center" key={index}>
            <div className="size-12 rounded-sm border border-[#e5e5e5] bg-background" />
          </div>
        ))}
      </div>
    </div>
  );
}
