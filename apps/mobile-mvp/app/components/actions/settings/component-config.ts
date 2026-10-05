export const componentNames = {
  build: "Build", inventory: "Inventory", chat: "Chat", activity: "Field report",
  admin: "Profile Admin", terminal: "Terminal", hud: "HUD",
} as const;
export type SettingsTarget = keyof typeof componentNames;
export type CustomSystem = { id: string; name: string; protocol: string; enabled: boolean };
export type ComponentConfig = { displayName: string; systems: CustomSystem[] };
export type ComponentConfigs = Record<SettingsTarget, ComponentConfig>;

export function createComponentConfigs(): ComponentConfigs {
  const config = (target: SettingsTarget): ComponentConfig => ({ displayName: componentNames[target], systems: [] });
  return { build: config("build"), inventory: config("inventory"), chat: config("chat"), activity: config("activity"), admin: config("admin"), terminal: config("terminal"), hud: config("hud") };
}

export function resolveSettingsTarget(activeView: PanelView | null, visorOpen: boolean, promptWindowOpen: boolean, previous: SettingsTarget): SettingsTarget {
  if (activeView === "settings" || activeView === "component-settings") return previous;
  return activeView && activeView !== "harness" ? activeView : (visorOpen && !promptWindowOpen ? "hud" : "terminal");
}

export function normalizeComponentConfig(config: ComponentConfig, target: SettingsTarget): ComponentConfig {
  return {
    displayName: config.displayName.trim() || componentNames[target],
    systems: config.systems.filter((system) => system.name.trim()).map((system) => ({ ...system, name: system.name.trim(), protocol: system.protocol.trim() })),
  };
}
import type { PanelView } from "../workspace-state.ts";
