"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, type HTMLAttributes, type ReactNode } from "react";

export function usePinScrollThumb(enabled = true) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updateThumb = useCallback((active = false) => {
    const container = scrollRef.current;
    const thumb = thumbRef.current;
    if (!container || !thumb) return;

    const scrollableHeight = container.scrollHeight - container.clientHeight;
    if (scrollableHeight <= 1) {
      thumb.style.opacity = "0";
      return;
    }

    const thumbHeight = Math.min(container.clientHeight, Math.max(24, container.clientHeight ** 2 / container.scrollHeight));
    const thumbTop = (container.scrollTop / scrollableHeight) * (container.clientHeight - thumbHeight);
    thumb.style.height = `${thumbHeight}px`;
    thumb.style.transform = `translateY(${thumbTop}px)`;

    if (active) {
      thumb.style.opacity = "1";
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      hideTimerRef.current = setTimeout(() => { thumb.style.opacity = "0"; }, 850);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const container = scrollRef.current;
    if (!container) return;
    const onScroll = () => updateThumb(true);
    const resizeObserver = new ResizeObserver(() => updateThumb());
    let content = container.firstElementChild;
    const mutationObserver = new MutationObserver(() => {
      const nextContent = container.firstElementChild;
      if (nextContent !== content) {
        if (content) resizeObserver.unobserve(content);
        content = nextContent;
        if (content) resizeObserver.observe(content);
      }
      updateThumb();
    });
    container.addEventListener("scroll", onScroll, { passive: true });
    resizeObserver.observe(container);
    if (content) resizeObserver.observe(content);
    mutationObserver.observe(container, { childList: true });
    return () => {
      container.removeEventListener("scroll", onScroll);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [enabled, updateThumb]);

  return { scrollRef, thumbRef, updateThumb };
}

export function PinScrollThumb({ thumbRef }: { thumbRef: ReturnType<typeof usePinScrollThumb>["thumbRef"] }) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 w-px">
      <div className="absolute left-0 top-0 w-px bg-white/70 opacity-0 transition-opacity duration-300" ref={thumbRef} />
    </div>
  );
}

export function PinScrollArea({
  children,
  className = "",
  wrapperClassName = "",
  ...props
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode; wrapperClassName?: string }) {
  const { scrollRef, thumbRef, updateThumb } = usePinScrollThumb();

  useLayoutEffect(() => updateThumb(), [children, updateThumb]);

  return (
    <div className={`relative min-h-0 min-w-0 ${wrapperClassName}`}>
      <div {...props} className={`pin-scrollbar h-full overflow-y-auto ${className}`} ref={scrollRef}>
        {children}
      </div>
      <PinScrollThumb thumbRef={thumbRef} />
    </div>
  );
}
