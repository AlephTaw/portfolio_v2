export const physicalCategories = ["Bathroom", "Office", "Kitchen", "Groceries", "Bedroom", "Garage", "Closet", "Storage"] as const;
export type PhysicalCategory = typeof physicalCategories[number] | "Miscellaneous";
export const essentialPossessions: { name: string; category: PhysicalCategory }[] = [
  { name: "Toothbrush", category: "Bathroom" }, { name: "Toothpaste", category: "Bathroom" }, { name: "Soap", category: "Bathroom" }, { name: "Towels", category: "Bathroom" },
  { name: "Laptop", category: "Office" }, { name: "Phone", category: "Office" }, { name: "Charger", category: "Office" }, { name: "Notebook", category: "Office" },
  { name: "Plates", category: "Kitchen" }, { name: "Cutlery", category: "Kitchen" }, { name: "Cookware", category: "Kitchen" }, { name: "Drinking glasses", category: "Kitchen" },
  { name: "Oatmeal", category: "Groceries" }, { name: "Rice", category: "Groceries" }, { name: "Fruit", category: "Groceries" }, { name: "Vegetables", category: "Groceries" },
  { name: "Bed", category: "Bedroom" }, { name: "Pillows", category: "Bedroom" }, { name: "Sheets", category: "Bedroom" }, { name: "Blanket", category: "Bedroom" },
  { name: "Tool kit", category: "Garage" }, { name: "Flashlight", category: "Garage" }, { name: "Extension cord", category: "Garage" }, { name: "Bicycle", category: "Garage" },
  { name: "Everyday clothes", category: "Closet" }, { name: "Shoes", category: "Closet" }, { name: "Coat", category: "Closet" }, { name: "Hangers", category: "Closet" },
  { name: "First-aid kit", category: "Storage" }, { name: "Cleaning supplies", category: "Storage" }, { name: "Vacuum", category: "Storage" }, { name: "Storage bins", category: "Storage" },
];
export const initialPhysicalLocations: Record<string, PhysicalCategory> = Object.fromEntries(essentialPossessions.map((item) => [item.name, item.category]));
