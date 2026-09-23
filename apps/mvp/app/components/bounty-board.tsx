"use client";

import { useEffect, useState, type FormEvent } from "react";
import { FiCheck, FiPlus } from "react-icons/fi";

const lifeCategories = ["Health", "Wealth", "Connection", "Sentience", "Competence", "Experience"] as const;

type Bounty = {
  id: string;
  title: string;
  description: string;
  reward: string;
  completed: boolean;
};

const storageKey = "speedrun-irl:bounties";
const updateEvent = "speedrun-irl:bounties-updated";

function readBounties(): Bounty[] {
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(storageKey) ?? "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is Bounty =>
      item !== null && typeof item === "object"
      && typeof item.id === "string"
      && typeof item.title === "string"
      && typeof item.description === "string"
      && typeof item.reward === "string"
      && typeof item.completed === "boolean",
    );
  } catch {
    return [];
  }
}

function writeBounties(bounties: Bounty[]) {
  window.localStorage.setItem(storageKey, JSON.stringify(bounties));
  window.dispatchEvent(new Event(updateEvent));
}

export function BountyBoard() {
  const [bounties, setBounties] = useState<Bounty[]>([]);
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [reward, setReward] = useState("");

  useEffect(() => {
    const sync = () => setBounties(readBounties());
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener(updateEvent, sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(updateEvent, sync);
    };
  }, []);

  const postBounty = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = title.trim();
    if (!name) return;
    writeBounties([
      { id: crypto.randomUUID(), title: name, description: description.trim(), reward: reward.trim(), completed: false },
      ...readBounties(),
    ]);
    setTitle("");
    setDescription("");
    setReward("");
    setCreating(false);
  };

  const completeBounty = (id: string) => {
    writeBounties(readBounties().map((bounty) => bounty.id === id ? { ...bounty, completed: true } : bounty));
  };

  const openBounties = bounties.filter((bounty) => !bounty.completed);
  const completedBounties = bounties.filter((bounty) => bounty.completed);

  return (
    <section aria-labelledby="bounty-board-heading" className="w-full text-left text-white">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-white/20 pb-5">
        <div>
          <p className="font-mono text-[0.6rem] uppercase tracking-[0.22em] text-white/40">Store</p>
          <h2 className="mt-2 text-xl font-semibold uppercase tracking-[0.18em]" id="bounty-board-heading">Bounty board</h2>
          <p className="mt-2 text-xs text-white/45">Post a goal and track it through completion.</p>
        </div>
        <button
          aria-expanded={creating}
          className="inline-flex cursor-pointer items-center gap-2 border border-white/45 px-3 py-2 text-[0.6rem] font-semibold uppercase tracking-[0.14em] transition-colors hover:border-white hover:bg-white hover:text-black focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white"
          onClick={() => setCreating((open) => !open)}
          type="button"
        >
          <FiPlus aria-hidden="true" className="size-3.5" />
          {creating ? "Cancel" : "Post bounty"}
        </button>
      </header>

      {creating && (
        <form className="mt-5 grid gap-4 border border-white/25 p-4 sm:p-5" onSubmit={postBounty}>
          <label className="grid gap-2 text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-white/55">
            Bounty title
            <input autoFocus className="w-full border border-white/30 bg-black px-3 py-2 text-sm font-normal normal-case tracking-normal text-white outline-none focus:border-white" maxLength={120} onChange={(event) => setTitle(event.target.value)} required value={title} />
          </label>
          <label className="grid gap-2 text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-white/55">
            Details <span className="sr-only">(optional)</span>
            <textarea className="min-h-20 w-full resize-y border border-white/30 bg-black px-3 py-2 text-sm font-normal normal-case tracking-normal text-white outline-none focus:border-white" maxLength={1000} onChange={(event) => setDescription(event.target.value)} value={description} />
          </label>
          <label className="grid gap-2 text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-white/55">
            Reward <span className="sr-only">(optional)</span>
            <input className="w-full border border-white/30 bg-black px-3 py-2 text-sm font-normal normal-case tracking-normal text-white outline-none focus:border-white" maxLength={80} onChange={(event) => setReward(event.target.value)} placeholder="Optional" value={reward} />
          </label>
          <button className="w-fit cursor-pointer bg-white px-4 py-2 text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-black transition-opacity hover:opacity-75 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white" type="submit">Post bounty</button>
        </form>
      )}

      {bounties.length === 0 ? (
        <div className="mt-5 grid min-h-40 place-items-center border border-dashed border-white/25 p-6 text-center text-[0.65rem] uppercase tracking-[0.16em] text-white/40">
          No bounties posted yet
        </div>
      ) : (
        <div className="mt-5 space-y-6">
          <div>
            <h3 className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-white/45">Open · {openBounties.length}</h3>
            {openBounties.length ? (
              <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                {openBounties.map((bounty) => (
                  <li className="flex min-w-0 flex-col border border-white/25 p-4" key={bounty.id}>
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <h4 className="min-w-0 break-words text-xs font-semibold uppercase tracking-[0.12em]">{bounty.title}</h4>
                      {bounty.reward && <span className="max-w-full break-words font-mono text-[0.55rem] uppercase tracking-[0.1em] text-white/55">{bounty.reward}</span>}
                    </div>
                    {bounty.description && <p className="mt-3 break-words whitespace-pre-wrap text-xs leading-5 text-white/60">{bounty.description}</p>}
                    <button className="mt-5 inline-flex w-fit cursor-pointer items-center gap-2 text-[0.55rem] font-semibold uppercase tracking-[0.14em] text-white/55 transition-colors hover:text-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white" onClick={() => completeBounty(bounty.id)} type="button"><FiCheck aria-hidden="true" className="size-3.5" /> Mark complete</button>
                  </li>
                ))}
              </ul>
            ) : <p className="mt-3 text-xs text-white/35">No open bounties</p>}
          </div>
          {completedBounties.length > 0 && (
            <div>
              <h3 className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-white/45">Completed · {completedBounties.length}</h3>
              <ul className="mt-3 divide-y divide-white/15 border-y border-white/15">
                {completedBounties.map((bounty) => <li className="flex flex-wrap items-center justify-between gap-2 py-3" key={bounty.id}><span className="break-words text-xs text-white/50 line-through">{bounty.title}</span>{bounty.reward && <span className="font-mono text-[0.55rem] uppercase tracking-[0.1em] text-white/40">{bounty.reward}</span>}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export function StoreContent() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-10">
      <BountyBoard />
      <section aria-labelledby="evolutionary-simulation-heading" className="border-t border-white/20 pt-6 text-left text-white">
        <p className="font-mono text-[0.6rem] uppercase tracking-[0.22em] text-white/40">Store</p>
        <h2 className="mt-2 text-xl font-semibold uppercase tracking-[0.18em]" id="evolutionary-simulation-heading">Evolutionary simulation</h2>
        <div className="mt-5 grid min-h-36 place-items-center border border-dashed border-white/25 p-6 text-center text-[0.65rem] uppercase tracking-[0.16em] text-white/40">
          Simulation coming soon
        </div>
      </section>
      <section aria-labelledby="store-categories-heading" className="text-white">
        <header className="border-b border-white/20 pb-5">
          <p className="font-mono text-[0.6rem] uppercase tracking-[0.22em] text-white/40">Store</p>
          <h2 className="mt-2 text-xl font-semibold uppercase tracking-[0.18em]" id="store-categories-heading">Life categories</h2>
        </header>
        <div aria-label="Life categories" className="mt-8 divide-y divide-white/20 border-x border-white/20">
          {lifeCategories.map((category) => (
            <section
              aria-labelledby={`store-${category.toLowerCase()}`}
              className="px-4 py-6 sm:px-6"
              key={category}
            >
              <h3 className="text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-white/55" id={`store-${category.toLowerCase()}`}>{category}</h3>
              <div className="mt-3 grid w-full grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
                {Array.from({ length: 6 }, (_, index) => (
                  <div
                    aria-label={`Empty ${category.toLowerCase()} store slot ${index + 1}`}
                    className="aspect-square w-3/4 justify-self-center border border-white/25 bg-white/[0.02]"
                    key={index}
                    role="img"
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>
    </div>
  );
}
