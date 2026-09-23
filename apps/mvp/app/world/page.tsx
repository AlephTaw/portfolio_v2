import type { Metadata } from "next";
import { WorldDisplay, type WorkshopApplication } from "./world-display";

export const metadata: Metadata = {
  title: "World | Speedrun IRL",
  description: "World.",
};

const workshopApplications = [
  "health",
  "wealth",
  "interactions",
  "sentience",
  "skills",
  "experience",
] as const satisfies readonly WorkshopApplication[];

function isWorkshopApplication(value: string | undefined): value is WorkshopApplication {
  return workshopApplications.some((application) => application === value);
}

export default async function WorldPage({
  searchParams,
}: {
  searchParams: Promise<{ app?: string; domain?: string }>;
}) {
  const { app, domain } = await searchParams;
  const workshopApplication = isWorkshopApplication(app) ? app : null;
  const explicitDestination = domain !== undefined || app !== undefined;

  return (
    <WorldDisplay
      explicitDestination={explicitDestination}
      initialLocation={domain === "workshop" ? "Workshop" : null}
      workshopApplication={workshopApplication}
    />
  );
}
