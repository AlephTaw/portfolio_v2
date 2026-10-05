"use client";

import Link from "next/link";
import { useState } from "react";
import { useWatcher } from "../../watcher/watcher";
import { ComponentHeading, ComponentSystems } from "../settings/component-systems";

const integrations = [
  { title: "Health App Integrations", description: "Health and activity data", options: ["Apple Health", "Health Connect"] },
  { title: "Calendar Integrations", description: "Events and availability", options: ["Google", "Apple", "Outlook"] },
];

// Mobile-owned adaptation of the MVP AdminContent's rendered sections. No MVP
// providers, authentication, payment, or integration backends are imported.
export function AdminView() {
  const { adminProfile, setAdminProfile } = useWatcher();
  const [draft, setDraft] = useState(adminProfile);
  const [saved, setSaved] = useState(false);
  const inputClass = "admin-input min-h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none focus:border-[var(--speedrun-blue)]";
  const update = (field: string, value: string) => { setDraft((previous) => ({ ...previous, [field]: value })); setSaved(false); };

  return <div className="admin-view view-glass min-h-full pb-8 text-white">
    <header className="flex h-11 items-center px-4"><ComponentHeading target="admin" /></header>
    <ComponentSystems target="admin" />
    <div className="mx-auto max-w-xl space-y-7 px-4">
      <section aria-labelledby="admin-profile-heading">
        <div className="mb-4 flex items-center gap-3">
          <span aria-hidden="true" className="h-10 w-10 rounded-full bg-[#242329]" style={{ backgroundImage: "url('/build-toon-covers-v4.png')", backgroundSize: "300% auto", backgroundPosition: "50% 22%" }} />
          <div><h2 id="admin-profile-heading" className="text-sm font-semibold">Profile</h2><p className="text-xs text-white/45">Your game workspace identity</p></div>
        </div>
        <form className="grid gap-3" onSubmit={(event) => { event.preventDefault(); setAdminProfile(draft); setSaved(true); }}>
          <div className="grid gap-3 sm:grid-cols-2">
            {["Username", "Email", "Age"].map((field) => <label key={field} className="grid gap-1 text-xs text-white/65">{field}<input className={inputClass} type={field === "Email" ? "email" : field === "Age" ? "number" : "text"} min={field === "Age" ? 0 : undefined} value={draft[field]} onChange={(event) => update(field, event.target.value)} /></label>)}
            <label className="grid gap-1 text-xs text-white/65">Sex<select className={inputClass} value={draft.Sex} onChange={(event) => update("Sex", event.target.value)}>{["Female", "Male"].map((option) => <option key={option}>{option}</option>)}</select></label>
            <label className="grid gap-1 text-xs text-white/65 sm:col-span-2">Subscription Type<select className={inputClass} value={draft["Subscription Type"]} onChange={(event) => update("Subscription Type", event.target.value)}>{["Free", "Pro", "Teams"].map((option) => <option key={option}>{option}</option>)}</select></label>
          </div>
          <label className="grid gap-1 text-xs text-white/65">Interests<textarea className={`${inputClass} min-h-20 resize-y`} value={draft.Interests} onChange={(event) => update("Interests", event.target.value)} /></label>
          <div className="flex flex-wrap items-center gap-3"><button type="submit" className="admin-accent-button min-h-11 rounded-full bg-[var(--app-accent)] px-4 text-xs text-white">Save Profile</button>{saved && <p role="status" className="text-xs text-white/55">Saved for this session.</p>}</div>
          <p className="text-[11px] text-white/45">Demo profile only. No account or subscription changes are sent.</p>
        </form>
      </section>
      <section aria-labelledby="admin-integrations-heading">
        <h2 id="admin-integrations-heading" className="text-sm font-semibold">Integrations</h2><p className="mt-1 text-xs text-white/45">Choose a service. Connections are coming soon.</p>
        <div className="mt-3 space-y-2">{integrations.map((group) => <details key={group.title} className="rounded-xl bg-black/15 px-3">
          <summary className="cursor-pointer py-3 text-xs font-medium">{group.title}<span className="mt-1 block text-[11px] font-normal text-white/45">{group.description}</span></summary>
          <ul className="pb-2">{group.options.map((option) => <li key={option} className="flex justify-between gap-3 py-2 text-xs"><span>{option}</span><span className="text-white/45">Coming soon</span></li>)}</ul>
        </details>)}</div>
      </section>
      <section aria-labelledby="admin-account-heading"><h2 id="admin-account-heading" className="text-sm font-semibold">Account</h2><p className="mt-1 text-xs text-white/45">No authenticated account is connected in this demo.</p><Link href="/" className="mt-3 inline-flex min-h-11 items-center rounded-full bg-black/20 px-4 text-xs">Logout · return to landing</Link></section>
    </div>
  </div>;
}
