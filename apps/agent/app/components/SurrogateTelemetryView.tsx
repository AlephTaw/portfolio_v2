import { CharacterStats } from "./character-sheet/CharacterStats";

export function SurrogateTelemetryView() {
  return (
    <section
      aria-label="Character stats detail"
      className="[&>:first-child]:!mt-0"
    >
      <CharacterStats showAttributeWorkspace />
    </section>
  );
}
