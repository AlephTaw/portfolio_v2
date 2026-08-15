import { readFile } from "node:fs/promises";
import { spawn, type ChildProcess } from "node:child_process";
import path from "node:path";
import vinext from "vinext";
import { defineConfig, type Plugin, type ViteDevServer } from "vite";
import hostingConfig from "./.openai/hosting.json";
import { sites } from "./build/sites-vite-plugin";

const SITE_CREATOR_PLACEHOLDER_DATABASE_ID =
  "00000000-0000-4000-8000-000000000000";

const { d1, r2 } = hostingConfig;

function markdownTextPlugin() {
  return {
    name: "swdev:markdown-text",
    enforce: "pre" as const,
    async load(id: string) {
      const filePath = id.split("?", 1)[0];

      if (!filePath.endsWith(".md")) {
        return null;
      }

      this.addWatchFile(filePath);

      return {
        code: `export default ${JSON.stringify(await readFile(filePath, "utf8"))};`,
        map: null,
        moduleType: "js" as const,
      };
    },
  };
}

function curriculumNotebookWatchPlugin(): Plugin {
  let server: ViteDevServer | null = null;
  let rebuildProcess: ChildProcess | null = null;
  let rebuildQueued = false;
  let debounceTimer: NodeJS.Timeout | null = null;
  const notebookRoot = path.resolve(process.cwd(), "notebooks");

  const isEditableNotebook = (filePath: string) => {
    const absolutePath = path.resolve(filePath);
    const relativePath = path.relative(notebookRoot, absolutePath);
    return (
      relativePath !== "" &&
      !relativePath.startsWith(`..${path.sep}`) &&
      !path.isAbsolute(relativePath) &&
      relativePath.endsWith(".py") &&
      !relativePath.split(path.sep).includes("units")
    );
  };

  const runRebuild = () => {
    if (!server) return;
    if (rebuildProcess) {
      rebuildQueued = true;
      return;
    }

    server.config.logger.info("[curriculum] rebuilding notebook preview...");
    rebuildProcess = spawn("npm", ["run", "curriculum:preview"], {
      cwd: process.cwd(),
      env: process.env,
      stdio: "inherit",
    });
    rebuildProcess.once("exit", (code, signal) => {
      rebuildProcess = null;
      if (code === 0) {
        server?.config.logger.info("[curriculum] preview updated");
        server?.ws.send({ type: "full-reload", path: "/mlphd" });
      } else {
        server?.config.logger.error(
          `[curriculum] rebuild failed (${signal ?? `exit ${code ?? "unknown"}`}); ` +
            "the dev server is still running",
        );
      }
      if (rebuildQueued) {
        rebuildQueued = false;
        runRebuild();
      }
    });
  };

  const scheduleRebuild = (filePath: string) => {
    if (!isEditableNotebook(filePath)) return;
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(runRebuild, 250);
  };

  return {
    name: "swdev:curriculum-notebook-watch",
    apply: "serve",
    configureServer(viteServer) {
      server = viteServer;
      viteServer.watcher.add(notebookRoot);
      viteServer.watcher.on("change", scheduleRebuild);
      viteServer.watcher.on("add", scheduleRebuild);
      viteServer.watcher.on("unlink", scheduleRebuild);
      viteServer.httpServer?.once("close", () => {
        if (debounceTimer) clearTimeout(debounceTimer);
        rebuildProcess?.kill("SIGTERM");
      });
    },
  };
}

// macOS Seatbelt blocks FSEvents, so Codex previews need polling for HMR.
const isCodexSeatbeltSandbox = process.env.CODEX_SANDBOX === "seatbelt";

const localBindingConfig = {
  main: "./worker/index.ts",
  d1_databases: d1
    ? [
        {
          binding: d1,
          database_name: "site-creator-d1",
          database_id: SITE_CREATOR_PLACEHOLDER_DATABASE_ID,
        },
      ]
    : [],
  r2_buckets: r2
    ? [
        {
          binding: r2,
          bucket_name: "site-creator-r2",
        },
      ]
    : [],
};

export default defineConfig(async () => {
  // Keep Wrangler and Miniflare state project-local. These are non-secret tool
  // settings; application environment belongs in ignored `.env*` files.
  process.env.WRANGLER_WRITE_LOGS ??= "false";
  process.env.WRANGLER_LOG_PATH ??= ".wrangler/logs";
  process.env.MINIFLARE_REGISTRY_PATH ??= ".wrangler/registry";

  // Wrangler snapshots its log path while the Cloudflare plugin is imported.
  const { cloudflare } = await import("@cloudflare/vite-plugin");

  return {
    server: isCodexSeatbeltSandbox
      ? { watch: { useFsEvents: false, usePolling: true } }
      : undefined,
    plugins: [
      markdownTextPlugin(),
      curriculumNotebookWatchPlugin(),
      vinext(),
      sites(),
      cloudflare({
        viteEnvironment: { name: "rsc", childEnvironments: ["ssr"] },
        config: localBindingConfig,
      }),
    ],
  };
});
