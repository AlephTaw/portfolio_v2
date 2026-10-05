import { ComponentHeading, ComponentSystems } from "../settings/component-systems";

export function HudView() {
  return <section aria-label="Heads-up display" className="h-full w-full">
    <div className="sr-only"><ComponentHeading target="hud" /></div>
    <ComponentSystems target="hud" />
  </section>;
}
