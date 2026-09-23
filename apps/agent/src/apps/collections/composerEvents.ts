import type { CollectionItemCreate } from "./types";

export const POPULATE_COMPOSER_EVENT = "agent:populate-composer";

export type PopulateComposerDetail = {
  action: {
    payload: CollectionItemCreate;
    type: "create-collection-item";
  };
  files: File[];
  prompt: string;
};
