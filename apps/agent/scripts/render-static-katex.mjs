import katex from "katex";

let input = "";
for await (const chunk of process.stdin) input += chunk;

const documents = JSON.parse(input);
const mathElement = /<marimo-tex\b[^>]*>([\s\S]*?)<\/marimo-tex>/g;

function renderMath(_match, encodedMath) {
  const displayMode = encodedMath.startsWith("||[") && encodedMath.endsWith("||]");
  const inlineMode = encodedMath.startsWith("||(") && encodedMath.endsWith("||)");
  if (!displayMode && !inlineMode) {
    throw new Error(`Unknown Marimo math delimiters: ${encodedMath}`);
  }

  const latex = encodedMath.slice(3, -3).replaceAll("\\\\", "\\");
  const rendered = katex.renderToString(latex, {
    displayMode,
    output: "htmlAndMathml",
    strict: "error",
    throwOnError: true,
  });
  return displayMode
    ? `<div class="mlphd-math-display">${rendered}</div>`
    : `<span class="mlphd-math-inline">${rendered}</span>`;
}

process.stdout.write(JSON.stringify(documents.map((document) => document.replace(mathElement, renderMath))));
