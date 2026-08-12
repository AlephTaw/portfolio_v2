import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${path}`, {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the public CV page", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Steven Wilcox - CV and Work<\/title>/i);
  assert.match(html, /Career Highlights/);
  assert.match(html, /Welcome to the game of life/);
  assert.match(html, /Curriculum Vitae/);
  assert.match(html, /Want to see your idea come to life or solve a challenging/);
  assert.match(html, /Experience/);
  assert.match(html, /Achievements/);
  assert.match(html, /top 14th percentile in the nation on the Putnam Exam/);
  assert.match(html, /Capabilities/);
  assert.match(html, /Selected Courses/);
  assert.doesNotMatch(html, /codex-preview|SkeletonPreview|react-loading-skeleton/);
});

test("server-renders detail pages", async () => {
  const pages = [
    ["/sirl", /SIRL/, /SIRL authentication background animation/],
    ["/mlphd", /Machine Learning PhD Quest/, /Data Science/],
    ["/contact", /Contact/, /Name \*/],
  ];

  for (const [path, heading, content] of pages) {
    const response = await render(path);
    assert.equal(response.status, 200);
    const html = await response.text();
    assert.match(html, heading);
    assert.match(html, content);
  }
});

test("opens the character sheet in the homepage portfolio pane", async () => {
  const response = await render("/?view=character-sheet");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /Character Sheet/);
  assert.match(html, /Campaign: The Crucible/);
  assert.match(html, />SQL</);
  assert.match(html, />Python</);
  assert.match(html, />Machine Learning</);
  assert.match(html, />Deployments</);
  assert.match(html, /Commit History/);
  assert.match(html, />B-Code</);
  assert.match(html, /chore: removed comment and commented out original paper color/);
  assert.match(html, /feat: character sheet, mlphd quest component integration/);
});

test("redirects the legacy live stats page to the character sheet view", async () => {
  const response = await render("/live-stats");
  assert.equal(response.status, 307);
  assert.equal(
    response.headers.get("location"),
    "http://localhost/?view=character-sheet",
  );
});

test("links the profile icons to the anonymized CV and social profiles", async () => {
  const response = await render();
  const html = await response.text();

  assert.match(html, /href="https:\/\/github\.com\/workbench-a"/);
  assert.match(html, /href="https:\/\/www\.linkedin\.com\/in\/steven-wilcox-0002"/);
  assert.match(html, /href="\/cv"/);
  assert.match(html, /href="\/contact"/);
  assert.match(html, /aria-label="Email"/);
});

test("keeps unpublished highlight routes inaccessible", async () => {
  const response = await render("/lhc");
  assert.equal(response.status, 404);

  const homeResponse = await render("/");
  const homeHtml = await homeResponse.text();
  assert.doesNotMatch(homeHtml, /href="\/lhc"/);
});

test("server-renders the CV viewer with a download fallback", async () => {
  const response = await render("/cv");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /Steven Wilcox - CV/);
  assert.match(html, /assets\/steven-wilcox-anonymized-resume\.pdf/);
  assert.match(html, /download="steven-wilcox-cv\.pdf"/);
  assert.match(html, /application\/pdf/);
});

test("removes disposable starter preview code", async () => {
  const [page, layout, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.doesNotMatch(page, /_sites-preview|SkeletonPreview|codex-preview/);
  assert.doesNotMatch(layout, /Starter Project|codex-preview/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
});
