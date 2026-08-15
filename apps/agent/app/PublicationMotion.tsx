"use client";

import { motion, useInView } from "framer-motion";
import type { ReactNode } from "react";
import { useRef } from "react";

type PublicationMotionProps = {
  children: ReactNode;
  className?: string;
};

const viewport = { once: false, margin: "-80px" };
const hidden = { y: 28, opacity: 0 };
const visible = { y: 0, opacity: 1 };
const enterTransition = { ease: "easeInOut" as const, duration: 0.475 };
const exitTransition = { ease: "easeInOut" as const, duration: 0.14 };

export function PublicationHeading({
  children,
  className,
}: PublicationMotionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, viewport);

  return (
    <motion.div
      ref={ref}
      initial={hidden}
      animate={isInView ? visible : hidden}
      transition={isInView ? enterTransition : exitTransition}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function PublicationRow({
  children,
  className,
}: PublicationMotionProps) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, viewport);

  return (
    <motion.article
      ref={ref}
      initial={hidden}
      animate={isInView ? visible : hidden}
      transition={isInView ? enterTransition : exitTransition}
      className={className}
    >
      {children}
    </motion.article>
  );
}
