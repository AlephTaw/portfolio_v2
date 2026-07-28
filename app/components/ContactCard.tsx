"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useLenis } from "lenis/dist/lenis-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type ContactCardProps = {
  backHref?: string;
  backLabel?: string;
  title?: string;
  description?: string;
  submitLabel?: string;
};

type FormStatus =
  | { type: "idle" }
  | { type: "success"; message: string }
  | { type: "error"; message: string };

function SuccessMark() {
  return (
    <motion.svg
      aria-hidden="true"
      className="size-24"
      fill="none"
      viewBox="0 0 96 96"
      initial="hidden"
      animate="visible"
    >
      <motion.circle
        cx="48"
        cy="48"
        r="36"
        stroke="#191714"
        strokeWidth="1.5"
        variants={{
          hidden: { pathLength: 0, opacity: 0.35 },
          visible: {
            pathLength: 1,
            opacity: 1,
            transition: { duration: 0.9, ease: "easeInOut" },
          },
        }}
      />
      <motion.path
        d="M31 49.5 43.5 62 67 38.5"
        stroke="#191714"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.75"
        variants={{
          hidden: { pathLength: 0, opacity: 0 },
          visible: {
            pathLength: 1,
            opacity: 1,
            transition: { delay: 0.45, duration: 0.55, ease: "easeInOut" },
          },
        }}
      />
    </motion.svg>
  );
}

export function ContactCard({
  backHref = "/",
  backLabel = "Back",
  title = "Contact",
  description = "",
  submitLabel = "Transmit",
}: ContactCardProps) {
  const [status, setStatus] = useState<FormStatus>({ type: "idle" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const lenis = useLenis();
  const cardRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!lenis) {
      return;
    }

    let frame = window.requestAnimationFrame(() => {
      frame = window.requestAnimationFrame(() => {
        lenis.resize();
      });
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [lenis, status.type]);

  useEffect(() => {
    if (status.type !== "success") {
      return;
    }

    cardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [status.type]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: "idle" });

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = (await response.json()) as {
        error?: string;
        message?: string;
      };

      if (!response.ok) {
        setStatus({
          type: "error",
          message:
            result.error ??
            "The message could not be delivered right now. Please try again shortly.",
        });
        return;
      }

      setStatus({
        type: "success",
        message: result.message ?? "Message sent. Thanks for reaching out.",
      });
      form.reset();
    } catch {
      setStatus({
        type: "error",
        message:
          "The message could not be delivered right now. Please try again shortly.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#FEFCF1] px-5 py-8 text-[#191714] sm:px-8 lg:px-10">
      <div className="mx-auto max-w-5xl">
        <Link
          className="text-xs font-semibold uppercase tracking-[0.32em] text-[#766b5d]"
          href={backHref}
        >
          {backLabel}
        </Link>

        <section ref={cardRef} className="mx-auto mt-10 max-w-3xl">
          <header className="space-y-5 border-b border-[#d8d0c1] pb-8 text-center">
            <h1 className="text-3xl font-light leading-tight sm:text-4xl">
              {title}
            </h1>
            <p className="mx-auto max-w-2xl text-base leading-7 text-[#514a40]">
              {description}
            </p>
          </header>

          <div className="mt-8 min-h-[36rem] border border-[#d8d0c1] bg-[#FEFCF1] p-5 sm:p-7">
            <AnimatePresence mode="wait">
              {status.type === "success" ? (
                <motion.div
                  key="success"
                  className="flex min-h-[32rem] flex-col items-center justify-center px-6 text-center"
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  onAnimationComplete={() => lenis?.resize()}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                >
                  <SuccessMark />
                  <motion.p
                    className="mt-8 font-serif text-2xl font-light italic text-[#615754]"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35, duration: 0.45, ease: "easeInOut" }}
                  >
                    Thanks for reaching out!
                  </motion.p>
                  <motion.p
                    className="mt-4 max-w-xl text-base leading-7 text-[#514a40]"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45, duration: 0.45, ease: "easeInOut" }}
                  >
                    {status.message}
                  </motion.p>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.55, duration: 0.45, ease: "easeInOut" }}
                  >
                    <Link
                      className="mt-8 inline-flex rounded-full border border-black px-5 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-black transition hover:bg-black hover:text-[#FEFCF1] focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 focus:ring-offset-[#FEFCF1]"
                      href={backHref}
                    >
                      {backLabel}
                    </Link>
                  </motion.div>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  className="min-h-[32rem]"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  onAnimationComplete={() => lenis?.resize()}
                  transition={{ duration: 0.35, ease: "easeInOut" }}
                  onSubmit={handleSubmit}
                >
                  <div className="grid gap-6 sm:grid-cols-2">
                    <label className="flex flex-col gap-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[#615754]">
                        Name *
                      </span>
                      <input
                        autoComplete="name"
                        className="min-h-12 border border-[#d8d0c1] bg-transparent px-4 text-base text-[#191714] outline-none transition focus:border-black"
                        name="name"
                        required
                        type="text"
                      />
                    </label>

                    <label className="flex flex-col gap-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[#615754]">
                        Email *
                      </span>
                      <input
                        autoComplete="email"
                        className="min-h-12 border border-[#d8d0c1] bg-transparent px-4 text-base text-[#191714] outline-none transition focus:border-black"
                        name="email"
                        required
                        type="email"
                      />
                    </label>
                  </div>

                  <label className="mt-6 flex flex-col gap-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[#615754]">
                      Organization
                    </span>
                    <input
                      autoComplete="organization"
                      className="min-h-12 border border-[#d8d0c1] bg-transparent px-4 text-base text-[#191714] outline-none transition focus:border-black"
                      name="organization"
                      type="text"
                    />
                  </label>

                  <label className="mt-6 flex flex-col gap-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[#615754]">
                      Subject *
                    </span>
                    <input
                      className="min-h-12 border border-[#d8d0c1] bg-transparent px-4 text-base text-[#191714] outline-none transition focus:border-black"
                      defaultValue=""
                      name="subject"
                      required
                      type="text"
                    />
                  </label>

                  <label className="sr-only" htmlFor="company-website">
                    Leave this field empty
                  </label>
                  <input
                    id="company-website"
                    autoComplete="off"
                    className="hidden"
                    name="companyWebsite"
                    tabIndex={-1}
                    type="text"
                  />

                  <label className="mt-6 flex flex-col gap-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[#615754]">
                      Message *
                    </span>
                    <textarea
                      className="min-h-48 resize-y border border-[#d8d0c1] bg-transparent px-4 py-3 text-base leading-7 text-[#191714] outline-none transition focus:border-black"
                      name="message"
                      required
                    />
                  </label>

                  <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <p
                      aria-live="polite"
                      className={`min-h-5 text-sm ${
                        status.type === "error" ? "text-[#7f4b31]" : "invisible"
                      }`}
                    >
                      {status.type === "error" ? status.message : "."}
                    </p>
                    <button
                      className="rounded-full border border-black px-5 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-black transition hover:bg-black hover:text-[#FEFCF1] focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 focus:ring-offset-[#FEFCF1] disabled:cursor-not-allowed disabled:opacity-70"
                      disabled={isSubmitting}
                      type="submit"
                    >
                      {isSubmitting ? "Sending..." : submitLabel}
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </section>
      </div>
    </main>
  );
}
