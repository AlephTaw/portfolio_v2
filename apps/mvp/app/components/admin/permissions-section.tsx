"use client";

import { useState } from "react";
import { adminLabelClass } from "./admin-styles";
import { SettingsRow } from "./settings-row";

const permissions = [
  ["Profile visibility", "Allow your profile to appear to other workspace members."],
  ["Activity sharing", "Share completed tasks and campaign activity with your team."],
  ["Personalization", "Use activity data to tailor recommendations and views."],
  ["Email notifications", "Receive account and campaign updates by email."],
] as const;

export function PermissionsSection() {
  const [enabled, setEnabled] = useState<Record<string, boolean>>({
    Personalization: true,
    "Email notifications": true,
  });

  return (
    <section>
      <h2 className={adminLabelClass}>Permissions</h2>
      <p className="mt-2 text-sm leading-6 text-white/45">Control how your profile and activity data can be used.</p>
      <div className="mt-4 grid gap-3">
        {permissions.map(([name, description]) => (
          <SettingsRow
            checked={!!enabled[name]}
            description={description}
            key={name}
            label={name}
            onChange={() => setEnabled((current) => ({ ...current, [name]: !current[name] }))}
          />
        ))}
      </div>
    </section>
  );
}
