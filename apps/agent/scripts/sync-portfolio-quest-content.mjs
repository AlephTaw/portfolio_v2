import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const agentRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const portfolioRoot = path.resolve(agentRoot, "../portfolio");
const catalogPath = path.join(
  portfolioRoot,
  "app/generated/curriculum-catalog.json",
);
const documentPath = path.join(
  portfolioRoot,
  "app/generated/mlphd-static-document.json",
);
const outputPath = path.join(
  agentRoot,
  "src/apps/quests/portfolioQuestContent.generated.json",
);

const questSources = {
  Python: { sectionId: "python-language" },
  SQL: { sectionId: "sql" },
  "Probability and Statistics": { sectionId: "probability-and-statistics" },
  Algorithms: { sectionId: "python-algorithms" },
  "ML in Practice": { sectionId: "machine-learning-interviews" },
  Containerization: { sectionId: "docker-compose" },
  "ML Deployments": {
    sectionId: "machine-learning-interviews",
    unitIds: ["ml-production-monitoring"],
  },
  Robotics: { sectionId: "robotics" },
};

function findSection(items, sectionId) {
  for (const item of items) {
    if (item.type === "section" && item.id === sectionId) return item;
    if (item.type === "section" && item.children) {
      const match = findSection(item.children, sectionId);
      if (match) return match;
    }
  }
  return null;
}

function decodeEntities(value) {
  const named = {
    amp: "&",
    apos: "'",
    gt: ">",
    lt: "<",
    nbsp: " ",
    quot: '"',
  };
  return value.replace(/&(#x?[\da-f]+|[a-z]+);/gi, (entity, code) => {
    if (code.startsWith("#x")) {
      return String.fromCodePoint(Number.parseInt(code.slice(2), 16));
    }
    if (code.startsWith("#")) {
      return String.fromCodePoint(Number.parseInt(code.slice(1), 10));
    }
    return named[code.toLowerCase()] ?? entity;
  });
}

function htmlToText(html) {
  return decodeEntities(
    html
      .replace(/<br\s*\/?\s*>/gi, "\n")
      .replace(/<li(?:\s[^>]*)?>/gi, "\n• ")
      .replace(/<\/(?:h[1-6]|p|li|ol|ul|tr|table|div|span)>/gi, "\n")
      .replace(/<[^>]+>/g, ""),
  )
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .join("\n");
}

const catalog = JSON.parse(await readFile(catalogPath, "utf8"));
const staticDocument = JSON.parse(await readFile(documentPath, "utf8"));
const unitMetadata = new Map(catalog.units.map((unit) => [unit.id, unit]));
const unitDocuments = new Map(
  staticDocument.units.map((unit) => [unit.id, unit]),
);
const rootItems = catalog.views.default.items;

const quests = Object.fromEntries(
  Object.entries(questSources).map(([questTitle, source]) => {
    const section = findSection(rootItems, source.sectionId);
    if (!section) {
      return [
        questTitle,
        {
          sectionId: source.sectionId,
          sectionTitle: questTitle,
          items: [],
        },
      ];
    }

    const requestedUnitIds = source.unitIds
      ?? section.children
        .filter((item) => item.type === "unit")
        .map((item) => item.unit);

    return [
      questTitle,
      {
        sectionId: section.id,
        sectionTitle: section.title,
        items: requestedUnitIds.map((unitId) => {
          const metadata = unitMetadata.get(unitId);
          const document = unitDocuments.get(unitId);
          const content = document?.blocks
            .filter((block) => block.kind === "static")
            .map((block) => htmlToText(block.html))
            .filter(Boolean)
            .join("\n\n") ?? "";

          return {
            id: unitId,
            title: metadata?.title ?? unitId,
            content,
          };
        }),
      },
    ];
  }),
);

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(
  outputPath,
  `${JSON.stringify(
    {
      source: {
        catalog: "apps/portfolio/app/generated/curriculum-catalog.json",
        document: "apps/portfolio/app/generated/mlphd-static-document.json",
      },
      quests,
    },
    null,
    2,
  )}\n`,
);
