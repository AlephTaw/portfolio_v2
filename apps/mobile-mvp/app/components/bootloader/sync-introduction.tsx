"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const builds = [
  { id: "balanced", name: "Balanced", description: "Build a sustainable foundation across all five areas." },
  { id: "builder", name: "Builder", description: "Emphasize skills, useful systems, and financial resilience." },
  { id: "explorer", name: "Explorer", description: "Emphasize awareness, learning, and new experiences." },
  { id: "connector", name: "Connector", description: "Emphasize relationships, community, and shared progress." },
] as const;

export function SyncIntroduction({ embedded = false }: { embedded?: boolean }) {
  const router = useRouter();
  const [build, setBuild] = useState<string>("");
  const [mode, setMode] = useState<"normal" | "speedrun" | "">("");
  const Heading = embedded ? "h2" : "h1";

  return <div className="mx-auto w-full max-w-md py-10 text-center sm:py-16">
    <Heading className="text-xs font-medium uppercase tracking-[0.18em] text-white/65">Welcome to the game of life</Heading>
    <div className="mt-8 space-y-5 text-sm leading-7 text-white/75">
      <p className="text-2xl font-light leading-9 tracking-tight text-white">Your life is the action space.</p>
      <p>This game is played through real actions, not time spent on a screen. Choose what matters, turn it into small daily commitments, and watch your character develop.</p>
      <p>Health, Wealth, Connections, Sentience, and Skills form your character sheet. Progress is personal: compare today with your own previous days, not someone else’s life.</p>
      <p>A build gives your journey an initial focus. It does not lock you into a role.</p>
    </div>

    <fieldset className="mt-9 text-left">
      <legend className="text-xs uppercase tracking-wider text-white/65">Choose your character build</legend>
      <div className="mt-3 space-y-1">
        {builds.map((option) => <label key={option.id} className="flex min-h-16 cursor-pointer items-start gap-3 py-3">
          <input type="radio" name="character-build" value={option.id} checked={build === option.id} onChange={() => setBuild(option.id)} className="mt-1 h-4 w-4 shrink-0 accent-white" />
          <span>
            <span className="block text-sm text-white">{option.name}</span>
            <span className="mt-1 block text-xs leading-5 text-white/50">{option.description}</span>
          </span>
        </label>)}
      </div>
    </fieldset>

    <fieldset className="mt-10">
      <legend className="mx-auto text-xs uppercase tracking-wider text-white/65">Choose mode</legend>
      <div className="mt-4 space-y-2">
        <label className="flex min-h-11 cursor-pointer items-center justify-center gap-3 text-sm text-white">
          <input type="radio" name="game-mode" value="normal" checked={mode === "normal"} onChange={() => setMode("normal")} className="h-4 w-4 accent-white" />
          Normal Mode
        </label>
        <label className="flex min-h-11 cursor-pointer items-center justify-center gap-3 text-sm text-white">
          <input type="radio" name="game-mode" value="speedrun" checked={mode === "speedrun"} onChange={() => setMode("speedrun")} className="h-4 w-4 accent-white" />
          Speedrun
        </label>
      </div>
      <blockquote className="relative mt-5 px-6 py-6 text-sm leading-7 text-white/70">
        <span aria-hidden="true" className="pointer-events-none absolute left-0 top-0 h-6 w-6 border-l border-t border-white/45" />
        <span aria-hidden="true" className="pointer-events-none absolute bottom-0 right-0 h-6 w-6 border-b border-r border-white/45" />
        <p className="italic">You may come to regret choosing this mode, but there will be no turning back. However, should you survive after overcoming insurmountable despair, you will undoubtedly learn a Principle of the World.</p>
        <p className="mt-4 text-xs leading-6 text-white/50">This mode was created by the npcs for fun.</p>
      </blockquote>
    </fieldset>

    <section className="mt-9" aria-labelledby="upload-question">
      <h2 id="upload-question" className="text-lg font-light text-white">Begin the bilateral upload?</h2>
      <p className="mt-3 text-sm leading-7 text-white/65">The exchange goes both ways: you bring your intentions and actions; the game reflects them back as a character, a plan, and feedback. You choose whether to begin.</p>
      <p className="mt-3 text-xs leading-5 text-white/45">Prototype preview: sign-in and data transfer are not connected. Nothing will be uploaded.</p>
      <button type="button" disabled={!build || !mode} onClick={() => router.push("/actions")} className="mt-6 min-h-11 rounded-full bg-white px-5 text-sm font-medium text-black transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-30">Begin bilateral upload and sync</button>
      {!embedded && <Link href="/" className="mx-auto mt-4 block w-fit py-3 text-xs text-white/50 hover:text-white">Not now</Link>}
    </section>
  </div>;
}
