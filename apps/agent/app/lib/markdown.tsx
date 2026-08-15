import matter from "gray-matter";
import GithubSlugger from "github-slugger";
import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

type TocItem = {
  id: string;
  text: string;
  level: number;
};

type DocumentMatter = {
  title?: string;
  description?: string;
};

function cleanHeadingText(value: string) {
  return value
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .trim();
}

export function parseMarkdownDocument(source: string) {
  const { content, data } = matter(source);
  const slugger = new GithubSlugger();
  const toc: TocItem[] = [];
  let inCodeFence = false;

  for (const line of content.split("\n")) {
    if (line.trim().startsWith("```")) {
      inCodeFence = !inCodeFence;
      continue;
    }

    if (inCodeFence) {
      continue;
    }

    const match = /^(#{1,4})\s+(.+)$/.exec(line);

    if (!match) {
      continue;
    }

    const level = match[1].length;
    const text = cleanHeadingText(match[2]);

    toc.push({
      id: slugger.slug(text),
      text,
      level,
    });
  }

  return {
    content,
    frontmatter: data as DocumentMatter,
    toc,
  };
}

export function createMarkdownComponents() {
  const slugger = new GithubSlugger();

  function headingTag(level: 1 | 2 | 3 | 4, children: React.ReactNode) {
    const text = flattenText(children);
    const id = slugger.slug(text);

    if (level === 1) {
      return (
        <h1
          className="mt-16 scroll-mt-28 font-serif text-3xl font-light leading-tight text-[#191714] first:mt-0 sm:text-4xl"
          id={id}
        >
          {children}
        </h1>
      );
    }

    if (level === 2) {
      return (
        <h2
          className="mt-12 scroll-mt-28 text-xl font-semibold uppercase tracking-[0.18em] text-[#615754]"
          id={id}
        >
          {children}
        </h2>
      );
    }

    if (level === 3) {
      return (
        <h3
          className="mt-10 scroll-mt-28 text-lg font-medium text-[#191714]"
          id={id}
        >
          {children}
        </h3>
      );
    }

    return (
      <h4
        className="mt-8 scroll-mt-28 text-base font-semibold text-[#514a40]"
        id={id}
      >
        {children}
      </h4>
    );
  }

  return {
    h1: ({ children }: { children?: React.ReactNode }) => headingTag(1, children),
    h2: ({ children }: { children?: React.ReactNode }) => headingTag(2, children),
    h3: ({ children }: { children?: React.ReactNode }) => headingTag(3, children),
    h4: ({ children }: { children?: React.ReactNode }) => headingTag(4, children),
    p: ({ children }: { children?: React.ReactNode }) => (
      <p className="mt-5 text-base leading-8 text-[#514a40]">{children}</p>
    ),
    ul: ({ children }: { children?: React.ReactNode }) => (
      <ul className="mt-5 list-disc space-y-2 pl-6 text-base leading-8 text-[#514a40]">
        {children}
      </ul>
    ),
    ol: ({ children }: { children?: React.ReactNode }) => (
      <ol className="mt-5 list-decimal space-y-2 pl-6 text-base leading-8 text-[#514a40]">
        {children}
      </ol>
    ),
    li: ({ children }: { children?: React.ReactNode }) => <li>{children}</li>,
    strong: ({ children }: { children?: React.ReactNode }) => (
      <strong className="font-semibold text-[#191714]">{children}</strong>
    ),
    code: ({
      children,
      className,
    }: {
      children?: React.ReactNode;
      className?: string;
    }) => {
      const isBlock = Boolean(className);

      if (isBlock) {
        return (
          <code className="block overflow-x-auto rounded-none border border-[#d8d0c1] bg-[#f8f3e7] px-4 py-3 font-mono text-sm text-[#191714]">
            {children}
          </code>
        );
      }

      return (
        <code className="rounded bg-[#f3ecde] px-1.5 py-0.5 font-mono text-[0.92em] text-[#191714]">
          {children}
        </code>
      );
    },
    pre: ({ children }: { children?: React.ReactNode }) => (
      <pre className="mt-5 overflow-x-auto border border-[#d8d0c1] bg-[#f8f3e7] p-4">
        {children}
      </pre>
    ),
    blockquote: ({ children }: { children?: React.ReactNode }) => (
      <blockquote className="mt-6 border-l border-[#191714] pl-5 font-serif text-lg font-thin italic leading-8 text-[#615754]">
        {children}
      </blockquote>
    ),
    hr: () => <hr className="mt-10 border-t border-[#d8d0c1]" />,
    a: ({
      children,
      href,
    }: {
      children?: React.ReactNode;
      href?: string;
    }) => (
      <a className="text-[#7f4b31] underline decoration-[#c8b8a0] underline-offset-4" href={href}>
        {children}
      </a>
    ),
  };
}

function flattenText(value: React.ReactNode): string {
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value.map(flattenText).join("");
  }

  if (value && typeof value === "object" && "props" in value) {
    const props = value.props as { children?: React.ReactNode };
    return flattenText(props.children);
  }

  return "";
}

export function MarkdownDocument({ source }: { source: string }) {
  return (
    <ReactMarkdown
      components={createMarkdownComponents()}
      rehypePlugins={[rehypeKatex]}
      remarkPlugins={[remarkGfm, remarkMath]}
    >
      {source}
    </ReactMarkdown>
  );
}
