"use client";

import { useState } from "react";

const integrations = ["Bank", "Google Calendar", "GitHub", "Toggl", "Slack"];
const permissions = [
  ["Profile visibility", "Allow your profile to appear to other workspace members."],
  ["Activity sharing", "Share completed tasks and campaign activity with your team."],
  ["Personalization", "Use activity data to tailor recommendations and views."],
  ["Email notifications", "Receive account and campaign updates by email."],
] as const;

const inputClass =
  "w-full border border-[#bdb4a7] bg-[#fbfaf6] px-3 py-2.5 text-[0.68rem] tracking-[0.08em] text-[#191919] outline-none transition-colors focus:border-[#191919]";
const labelClass =
  "text-[0.5rem] font-semibold uppercase tracking-[0.2em] text-[#6d6d6d]";

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <button
      aria-label={`Toggle ${label}`}
      aria-pressed={checked}
      className={`relative h-5 w-9 shrink-0 rounded-full border border-[#6d6d6d] transition-colors ${checked ? "bg-[#191919]" : "bg-transparent"}`}
      onClick={onChange}
      type="button"
    >
      <span className={`absolute top-1/2 size-3.5 -translate-y-1/2 rounded-full transition-[left] ${checked ? "left-[1.1rem] bg-[#fbfaf6]" : "left-0.5 bg-[#6d6d6d]"}`} />
    </button>
  );
}

export function AccountSettings() {
  const [saved, setSaved] = useState(false);
  const [theme, setTheme] = useState("Light");
  const [paymentMethod, setPaymentMethod] = useState(false);
  const [enabled, setEnabled] = useState<Record<string, boolean>>({
    Bank: false,
    "Google Calendar": false,
    GitHub: false,
    Toggl: true,
    Slack: false,
    "Profile visibility": false,
    "Activity sharing": false,
    Personalization: true,
    "Email notifications": true,
  });

  const toggle = (name: string) => {
    setEnabled((current) => ({ ...current, [name]: !current[name] }));
    setSaved(false);
  };

  return (
    <section className="mx-auto w-full max-w-xl pb-16 text-[#191919]">
      <p className={labelClass}>Account &amp; Settings</p>
      <h1 className="mt-3 text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">Account &amp; Preferences</h1>
      <p className="mt-3 max-w-lg text-sm leading-6 text-[#766b5d]">Manage the identity and preferences used throughout your game workspace.</p>

      <form className="mt-9 grid gap-8" onSubmit={(event) => { event.preventDefault(); setSaved(true); }}>
        <div className="grid gap-5 sm:grid-cols-2">
          {(["Username", "Email", "Age"] as const).map((field) => (
            <label className="grid gap-2" key={field}>
              <span className={labelClass}>{field}</span>
              <input className={inputClass} defaultValue={field === "Username" ? "Steven Wilcox" : field === "Email" ? "steven@example.com" : ""} placeholder={field === "Age" ? "Enter age" : undefined} type={field === "Email" ? "email" : field === "Age" ? "number" : "text"} />
            </label>
          ))}
          <label className="grid gap-2">
            <span className={labelClass}>Sex</span>
            <select className={inputClass} defaultValue="Male"><option>Female</option><option>Male</option></select>
          </label>
          <label className="grid gap-2 sm:col-span-2">
            <span className={labelClass}>Subscription Type</span>
            <select className={inputClass} defaultValue="Pro"><option>Free</option><option>Pro</option><option>Teams</option></select>
          </label>
        </div>

        <label className="grid gap-2">
          <span className={labelClass}>Interests</span>
          <textarea className={`${inputClass} min-h-28 resize-y leading-6`} defaultValue="Game design, artificial intelligence, systems thinking" placeholder="Add interests separated by commas" />
        </label>

        <section className="border-t border-[#d8d0c1] pt-7">
          <h2 className={labelClass}>Appearance</h2>
          <p className="mt-2 text-sm leading-6 text-[#766b5d]">Choose how the workspace is displayed on this device.</p>
          <div className="mt-4 inline-flex border border-[#191919] p-0.5">
            {(["Light", "Dark"] as const).map((option) => <button className={`min-w-20 px-3 py-2 text-[0.55rem] font-semibold uppercase tracking-[0.16em] ${theme === option ? "bg-[#191919] text-[#fbfaf6]" : "text-[#766b5d]"}`} key={option} onClick={() => setTheme(option)} type="button">{option}</button>)}
          </div>
        </section>

        <section className="border-t border-[#d8d0c1] pt-7">
          <div className="flex items-start justify-between gap-4"><div><h2 className={labelClass}>Payment Method</h2><p className="mt-2 text-sm leading-6 text-[#766b5d]">Used for your subscription and in-game purchases.</p></div><button className="shrink-0 border border-[#191919] px-3 py-2 text-[0.52rem] font-semibold uppercase tracking-[0.14em]" onClick={() => setPaymentMethod(!paymentMethod)} type="button">{paymentMethod ? "Change" : "Add Payment Method"}</button></div>
          <p className="mt-5 border-y border-[#d8d0c1] py-4 text-sm italic text-[#8a8a8a]">{paymentMethod ? "Visa ending in 4242 · Expires 12/28" : "No payment method added."}</p>
        </section>

        <SettingsGroup title="App Integrations" description="Choose which external services can connect to your workspace.">
          {integrations.map((name) => <SettingsRow key={name} label={name} description={`Connect ${name} to your workspace.`} checked={!!enabled[name]} onChange={() => toggle(name)} />)}
        </SettingsGroup>
        <SettingsGroup title="Permissions" description="Control how your profile and activity data can be used.">
          {permissions.map(([name, description]) => <SettingsRow key={name} label={name} description={description} checked={!!enabled[name]} onChange={() => toggle(name)} />)}
        </SettingsGroup>

        <div className="flex items-center gap-4 border-t border-[#d8d0c1] pt-6"><button className="bg-[#191919] px-5 py-3 text-[0.58rem] font-semibold uppercase tracking-[0.2em] text-[#fbfaf6]" type="submit">Save Settings</button>{saved ? <p className="font-mono text-xs text-[#766b5d]">Settings saved.</p> : null}</div>
      </form>
    </section>
  );
}

function SettingsGroup({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return <section className="border-t border-[#d8d0c1] pt-7"><h2 className={labelClass}>{title}</h2><p className="mt-2 text-sm leading-6 text-[#766b5d]">{description}</p><div className="mt-4 divide-y divide-[#d8d0c1] border-y border-[#d8d0c1]">{children}</div></section>;
}

function SettingsRow({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: () => void }) {
  return <div className="flex items-center justify-between gap-4 py-4"><div><p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em]">{label}</p><p className="mt-1 text-xs leading-5 text-[#766b5d]">{description}</p></div><Toggle checked={checked} label={label} onChange={onChange} /></div>;
}
