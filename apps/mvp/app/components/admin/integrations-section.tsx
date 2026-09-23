import { FiActivity, FiCalendar, FiChevronDown } from "react-icons/fi";
import { PiMicrosoftOutlookLogoFill } from "react-icons/pi";
import { SiApple, SiGooglecalendar } from "react-icons/si";
import { adminLabelClass } from "./admin-styles";

const integrationGroups = [
  {
    title: "Health App Integrations",
    description: "Health and activity data",
    Icon: FiActivity,
    options: ["Apple Health", "Health Connect"],
  },
  {
    title: "Calendar Integrations",
    description: "Events and availability",
    Icon: FiCalendar,
    options: ["Google", "Apple", "Outlook"],
  },
] as const;

const calendarLogos = {
  Google: SiGooglecalendar,
  Apple: SiApple,
  Outlook: PiMicrosoftOutlookLogoFill,
};

export function IntegrationsSection() {
  return (
    <section aria-labelledby="account-integrations-heading" className="mx-auto mt-16 w-full max-w-2xl border-t border-white/20 pt-10 text-white">
      <p className={adminLabelClass}>Account</p>
      <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em]" id="account-integrations-heading">
        Integrations
      </h2>
      <p className="mt-3 text-sm leading-6 text-white/45">
        Choose a service to connect to your workspace. Connections are coming soon.
      </p>

      <div className="mt-10 divide-y divide-white/15 border-y border-white/15">
        {integrationGroups.map(({ title, description, Icon, options }) => (
          <details className="group" key={title}>
            <summary className="flex cursor-pointer list-none items-center gap-4 py-5 text-left hover:text-white/75 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white [&::-webkit-details-marker]:hidden">
              <Icon aria-hidden="true" className="size-4 shrink-0 text-white/65" />
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-semibold uppercase tracking-[0.14em]">{title}</span>
                <span className="mt-1 block text-sm leading-5 text-white/45">{description}</span>
              </span>
              <FiChevronDown aria-hidden="true" className="size-4 shrink-0 text-white/55 transition-transform group-open:rotate-180" />
            </summary>
            <ul className="divide-y divide-white/10 border-t border-white/10 pl-8">
              {options.map((name) => {
                const Logo = calendarLogos[name as keyof typeof calendarLogos];
                return (
                  <li className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-4" key={name}>
                    <span className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.14em]">
                      {Logo && <Logo aria-hidden="true" className="size-4 shrink-0" />}
                      {name}
                    </span>
                    <span className="font-mono text-[0.625rem] uppercase tracking-[0.14em] text-white/45">Coming soon</span>
                  </li>
                );
              })}
            </ul>
          </details>
        ))}
      </div>
    </section>
  );
}
