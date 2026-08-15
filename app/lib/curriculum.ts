export type Difficulty = "easy" | "medium" | "hard";
export type CurriculumUnitKind = "exposition" | "exercise";

export type CurriculumConcept = {
  id: string;
  title: string;
  requires: string[];
};

export type CurriculumUnit = {
  id: string;
  title: string;
  notebook: string;
  outputPath: string;
  kind: CurriculumUnitKind;
  difficulty: Difficulty;
  teaches: string[];
  assesses: string[];
  topics: string[];
  roles: string[];
  goals: string[];
};

export type CurriculumSectionItem = {
  type: "section";
  id: string;
  title: string;
  order: number;
  children: CurriculumViewItem[];
};

export type CurriculumUnitItem = {
  type: "unit";
  unit: string;
  order: number;
};

export type CurriculumViewItem = CurriculumSectionItem | CurriculumUnitItem;

export type FlattenedCurriculumItem =
  | (Omit<CurriculumSectionItem, "children"> & { depth: number })
  | (CurriculumUnitItem & { depth: number });

export type CurriculumView = {
  title: string;
  items: CurriculumViewItem[];
  flattened: FlattenedCurriculumItem[];
};

export type CurriculumCatalog = {
  schemaVersion: 1;
  concepts: CurriculumConcept[];
  units: CurriculumUnit[];
  views: Record<string, CurriculumView> & { default: CurriculumView };
};
