"use client";

import type { TerminalCategory } from "../../actions/terminal-categories";
import type { CategoryProgressProps } from "./shared/category-dashboard";
import { JourneyTabs } from "./journey/journey-tabs";
import { ConnectionsApp } from "./connection/connections-app";
import { WealthApp } from "./wealth/wealth-app";
import { HealthApp } from "./health/health-app";
import { SentienceApp } from "./sentience/sentience-app";
import { SkillsApp } from "./skills/skills-app";

export function CategoryAppView({ category, ...progress }: CategoryProgressProps & { category: TerminalCategory }) {
  const apps = { Health: HealthApp, Wealth: WealthApp, Sentience: SentienceApp, Skills: SkillsApp, Connections: ConnectionsApp, Journey: JourneyTabs };
  const App = apps[category];
  return <div className="system-utility-app"><App {...progress} /></div>;
}
