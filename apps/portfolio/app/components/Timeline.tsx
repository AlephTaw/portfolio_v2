type TimelineItem = {
  title: string;
  body: string;
};

export function Timeline({
  items,
  label,
}: {
  items: TimelineItem[];
  label: string;
}) {
  return (
    <section aria-label={label} className="py-12">
      <div className="relative ml-4 border-l border-black pl-10">
        {items.map((item, index) => (
          <article
            className="relative pb-12 last:pb-0"
            key={`${item.title}-${index}`}
          >
            <img
              alt=""
              aria-hidden="true"
              className="absolute left-[-62px] top-0 size-11"
              src="/timeline_markers.svg"
            />
            <h2 className="text-xl font-medium">{item.title}</h2>
            <p className="mt-3 max-w-2xl text-base leading-7 text-[#514a40]">
              {item.body}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
