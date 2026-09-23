export type CollectionName = "inventory" | "achievements" | "store";

export type CollectionItem = {
  id: string;
  collection: CollectionName;
  name: string;
  summary: string;
  description: string;
  thumbnail_url: string | null;
  image_url: string | null;
  details: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type CollectionItemCreate = Omit<
  CollectionItem,
  "id" | "created_at" | "updated_at"
>;

export type CollectionItemUpdate = Partial<
  Omit<CollectionItemCreate, "collection">
>;

export const inventoryCategories = [
  "kitchen",
  "food",
  "bedroom",
  "bathroom",
  "office",
  "transportation",
  "clothing",
  "systems",
] as const;

export type InventoryCategory = (typeof inventoryCategories)[number];
