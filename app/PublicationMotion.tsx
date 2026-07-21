"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

type PublicationMotionProps = {
  children: ReactNode;
  className?: string;
};

const viewport = { once: true, margin: "-80px" };
const transition = { ease: "easeInOut" as const, duration: 0.75 };

export function PublicationHeading({
  children,
  className,
}: PublicationMotionProps) {
  return (
    <motion.div
      initial={{ y: 48, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      transition={transition}
      viewport={viewport}
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
  return (
    <motion.article
      initial={{ y: 48, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      transition={transition}
      viewport={viewport}
      className={className}
    >
      {children}
    </motion.article>
  );
}
