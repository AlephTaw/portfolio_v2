import type { ActivityCategory } from "./quest-terminal/use-active-activity";

export type QuestContext<Category extends string> = {
  id: string;
  name: string;
  workingSystemModel: {
    taskOntology: {
      activityCategory: ActivityCategory;
      categories: readonly Category[];
      skills: readonly { name: string; category: Category }[];
    };
  };
};

const subjectMasteryCategories = [
  "Engineering", "Mathematics", "Cooking", "Fitness", "Dopamine mastery", "Executive function",
] as const;

export type SubjectMasteryCategory = (typeof subjectMasteryCategories)[number];

export const subjectMasteryQuest = {
  id: "Quest-subject-mastery",
  name: "Subject Mastery",
  workingSystemModel: {
    taskOntology: {
      activityCategory: "Competence",
      categories: subjectMasteryCategories,
      skills: [
        { name: "Full stack development", category: "Engineering" },
        { name: "Mobile development", category: "Engineering" },
        { name: "Cloud", category: "Engineering" },
        { name: "DevOps", category: "Engineering" },
        { name: "ML Engineering", category: "Engineering" },
        { name: "Data Science", category: "Mathematics" },
        { name: "AI Systems Engineering", category: "Engineering" },
        { name: "Research & Development", category: "Engineering" },
        { name: "Discipline", category: "Executive function" },
        { name: "Emotional processing", category: "Executive function" },
      ],
    },
  },
} as const satisfies QuestContext<SubjectMasteryCategory>;
