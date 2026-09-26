"use client";

import { useState } from "react";
import portrait from "../../../../agent/public/assets/live-stats-profile.png";
import { adminInputClass, adminLabelClass } from "./admin-styles";

export function ProfileSection() {
  const [saved, setSaved] = useState(false);

  return (
    <section className="mx-auto w-full max-w-2xl text-white">
      <header className="flex items-stretch gap-4">
        <div className="relative w-16 shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt="Steven Wilcox profile" src={portrait.src} className="absolute left-0 top-0 aspect-square h-full w-auto rounded-full border border-white/25 object-cover" />
        </div>
        <div>
          <p className={adminLabelClass}>Admin</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">Profile</h1>
        </div>
      </header>
      <p className="mt-3 max-w-xl text-base leading-7 text-white/45">
        Manage the identity used throughout your game workspace.
      </p>

      <form
        className="mt-10 grid gap-8"
        onSubmit={(event) => {
          event.preventDefault();
          setSaved(true);
        }}
      >
        <div className="grid gap-5 sm:grid-cols-2">
          {(["Username", "Email", "Age"] as const).map((field) => (
            <label className="grid gap-2" key={field}>
              <span className={adminLabelClass}>{field}</span>
              <input
                className={adminInputClass}
                defaultValue={field === "Username" ? "Steven Wilcox" : field === "Email" ? "steven@example.com" : ""}
                onChange={() => setSaved(false)}
                placeholder={field === "Age" ? "Enter age" : undefined}
                type={field === "Email" ? "email" : field === "Age" ? "number" : "text"}
              />
            </label>
          ))}
          <label className="grid gap-2">
            <span className={adminLabelClass}>Sex</span>
            <select className={adminInputClass} defaultValue="Male" onChange={() => setSaved(false)}>
              <option className="bg-black">Female</option>
              <option className="bg-black">Male</option>
            </select>
          </label>
          <label className="grid gap-2 sm:col-span-2">
            <span className={adminLabelClass}>Subscription Type</span>
            <select className={adminInputClass} defaultValue="Pro" onChange={() => setSaved(false)}>
              <option className="bg-black">Free</option>
              <option className="bg-black">Pro</option>
              <option className="bg-black">Teams</option>
            </select>
          </label>
        </div>

        <label className="grid gap-2">
          <span className={adminLabelClass}>Interests</span>
          <textarea
            className={`${adminInputClass} min-h-28 resize-y leading-6`}
            defaultValue="Game design, artificial intelligence, systems thinking"
            onChange={() => setSaved(false)}
          />
        </label>

        <div className="flex items-center gap-4 pt-2">
          <button
            className="bg-white px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-black transition-opacity hover:opacity-75"
            type="submit"
          >
            Save Profile
          </button>
          {saved && <p className="font-mono text-xs text-white/45">Profile saved.</p>}
        </div>
      </form>
    </section>
  );
}
