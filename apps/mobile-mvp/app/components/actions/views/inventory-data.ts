import { appSystems } from "../game-design/system-catalog";
import { essentialPossessions } from "./physical-inventory-data";

export const initialInventoryApps = appSystems.filter((system) => system.category === "App").map((system) => system.name);
export const initialInventorySystems = [...new Set(appSystems.filter((system) => system.category !== "App").map((system) => system.name))];

export const mockInventoryItems = essentialPossessions.map((item) => item.name);
