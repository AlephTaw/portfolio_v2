import Link from "next/link";

type HighlightCardProps = {
  title: string;
  period: string;
  description: string;
  tags: string[];
  href?: string;
  progressBar?: boolean;
};

export function HighlightCard({
  title,
  period,
  description,
  tags,
  href,
  progressBar = false,
}: HighlightCardProps) {
  return (
    <article className="group grid gap-5 border border-[#d8d0c1] bg-background p-5 transition-colors duration-300 hover:border-black md:grid-cols-[1fr_1.4fr]">
      <div className="flex min-h-full flex-col">
        <div>
          <p className="text-sm text-[#8D7A70]">{period}</p>
          <h3 className="mt-2 text-xl font-medium">{title}</h3>
          {progressBar ? (
            <div aria-hidden="true" className="mt-4 h-1.5 w-32 border border-black">
              <div className="h-full w-9 bg-black" />
            </div>
          ) : null}
        </div>
        {href ? (
          <Link
            className="mt-auto pt-5 text-sm font-medium text-[#8D7A70] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            href={href}
          >
            Explore &gt;&gt;
          </Link>
        ) : null}
      </div>
      <div>
        <p className="text-base leading-7 text-[#514a40]">{description}</p>
        <ul className="mt-5 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <li
              className="border border-[#d8d0c1] px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-[#615754]"
              key={tag}
            >
              {tag}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
