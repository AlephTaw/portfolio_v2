"use client";

import { useEffect, useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { SiApple } from "react-icons/si";

export function ProviderSignup() {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [connectedEmail, setConnectedEmail] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    if (new URLSearchParams(window.location.search).has("error")) {
      // Do not render raw provider error messages or tokens into the page.
      Promise.resolve().then(() => setError("Sign-up was cancelled or could not be completed. Please try again."));
    }
    fetch("/api/auth/session", { cache: "no-store", signal: controller.signal })
      .then(async (response) => response.ok ? response.json() : null)
      .then((session) => {
        if (controller.signal.aborted || !session?.user?.email) return;
        setConnectedEmail(session.user.email);
      })
      .catch(() => { /* Keep the provider buttons available to retry. */ });
    return () => controller.abort();
  }, []);

  async function signUp(provider: "google" | "apple") {
    if (busy) return;
    setBusy(provider);
    setError("");
    try {
      const csrfResponse = await fetch("/api/auth/csrf", { cache: "no-store" });
      const csrf = await csrfResponse.json();
      if (!csrfResponse.ok || !csrf.csrfToken) throw new Error(csrf.error || "Sign-up is unavailable. Please try again.");
      const response = await fetch(`/api/auth/signin/${provider}`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded", "X-Auth-Return-Redirect": "1" },
        body: new URLSearchParams({ csrfToken: csrf.csrfToken, callbackUrl: `${window.location.origin}/?auth=return` }),
      });
      const result = await response.json();
      if (!response.ok || !result.url) throw new Error(result.error || "Sign-up could not be started. Please try again.");
      window.location.assign(result.url);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Sign-up is unavailable. Please try again.");
      setBusy(null);
    }
  }

  return (
    <div>
      {connectedEmail ? <p role="status" className="text-sm leading-6 text-white/65">Connected as {connectedEmail}</p> : (
        <div className="flex flex-col gap-3">
          {([{ id: "google", label: "Google", Icon: FcGoogle }, { id: "apple", label: "Apple", Icon: SiApple }] as const).map(({ id, label, Icon }) => (
            <button key={id} type="button" disabled={busy !== null} onClick={() => void signUp(id)}
              className="flex min-h-12 items-center justify-center gap-3 rounded-full border border-white/45 bg-black px-4 py-3 text-sm text-white transition-colors hover:border-white disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
              <Icon aria-hidden="true" size={20} />{busy === id ? "Connecting…" : `Sign up with ${label}`}
            </button>
          ))}
        </div>
      )}
      {error && <p role="alert" className="mt-4 text-sm leading-6 text-white/65">{error}</p>}
    </div>
  );
}
