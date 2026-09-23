"use client";

import { FormEvent, useState } from "react";

const storageKey = "speedrun-irl:beta-signup";

export function SignupForm() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    window.localStorage.setItem(storageKey, email.trim());
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="border-t border-white/30 pt-8" role="status">
        <p className="text-sm uppercase tracking-[0.16em]">You&apos;re on the list.</p>
        <p className="mt-3 text-sm leading-6 text-white/55">We&apos;ll reach out when beta access opens.</p>
        <button
          className="mt-8 text-xs uppercase tracking-[0.14em] text-white/55 underline decoration-white/35 underline-offset-4 transition-colors hover:text-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-white"
          onClick={() => setSubmitted(false)}
          type="button"
        >
          Change email
        </button>
      </div>
    );
  }

  return (
    <form className="border-t border-white/30 pt-8" onSubmit={submit}>
      <label className="block text-xs uppercase tracking-[0.16em] text-white/55" htmlFor="beta-email">
        Email address
      </label>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input
          autoComplete="email"
          className="min-w-0 flex-1 border border-white/45 bg-black px-4 py-3 text-base text-white outline-none transition-colors placeholder:text-white/30 focus:border-white"
          id="beta-email"
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          required
          type="email"
          value={email}
        />
        <button
          className="shrink-0 border border-white bg-white px-6 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-black transition-colors hover:bg-black hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          type="submit"
        >
          Sign up
        </button>
      </div>
    </form>
  );
}
