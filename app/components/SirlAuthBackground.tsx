"use client";

import { motion, useReducedMotion } from "framer-motion";

const panels = [
  { className: "left-[4%] top-[9%] w-[31%]", src: "/sirl-entry/panel-3.png" },
  { className: "left-[18%] top-[37%] w-[62%]", src: "/sirl-entry/panel-2.png" },
  { className: "right-[4%] top-[66%] w-[31%]", src: "/sirl-entry/panel-4.png" },
  { className: "left-[12%] top-[77%] w-[38%]", src: "/sirl-entry/panel-5.png" },
] as const;

const transition = { duration: 3.5, ease: [0.22, 1, 0.24, 1] } as const;

export function SirlAuthBackground() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      aria-label="SIRL authentication background animation"
      className="relative mx-auto aspect-video w-full max-w-3xl overflow-hidden border border-black bg-[#09090b]"
    >
      <motion.div
        animate={{ clipPath: "inset(0% 0% 0% 0%)", opacity: 0.2, scale: 1 }}
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        initial={
          reduceMotion
            ? false
            : { clipPath: "inset(25% 25% 25% 25%)", opacity: 1, scale: 1.7 }
        }
        style={{ backgroundImage: "url('/sirl-entry/panel-1.png')" }}
        transition={reduceMotion ? { duration: 0 } : transition}
      />

      <div className="absolute inset-0 overflow-hidden">
        {panels.map((panel, index) => (
          <motion.img
            alt=""
            animate={{
              opacity: 0,
              scale: 0.85,
              y: index % 2 === 0 ? 200 : -250,
            }}
            aria-hidden="true"
            className={`absolute box-border border-4 border-zinc-200 ${panel.className}`}
            initial={
              reduceMotion
                ? false
                : {
                    opacity: 1,
                    scale: 1,
                    y: index % 2 === 0 ? -200 : 200,
                  }
            }
            key={panel.src}
            src={panel.src}
            transition={reduceMotion ? { duration: 0 } : transition}
          />
        ))}
      </div>
    </section>
  );
}
