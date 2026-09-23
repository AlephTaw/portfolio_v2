import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { sites } from '@openai/sites-vite-plugin';
import tailwindcss from '@tailwindcss/postcss';
import vinext from 'vinext';
import { defineConfig, type Plugin } from 'vite';
import hostingConfig from './.openai/hosting.json';

const SITE_CREATOR_PLACEHOLDER_DATABASE_ID =
  '00000000-0000-4000-8000-000000000000';

const { d1, r2 } = hostingConfig;

const homepageReelModule = 'virtual:mmvp-homepage-reel';
const resolvedHomepageReelModule = `\0${homepageReelModule}`;
const videoExtensions = new Set(['.mp4', '.webm', '.mov', '.m4v']);
const videoPriority = ['.mp4', '.webm', '.m4v', '.mov'];

async function findHomepageReel(root: string) {
  const reelDirectory = path.resolve(root, 'public', 'homepage_reel');
  try {
    const files = await readdir(reelDirectory, { withFileTypes: true });
    const video = files
      .filter((file) => file.isFile() && videoExtensions.has(path.extname(file.name).toLowerCase()))
      .map((file) => file.name)
      .sort((left, right) => {
        const leftExtension = path.extname(left).toLowerCase();
        const rightExtension = path.extname(right).toLowerCase();
        const priorityDifference =
          videoPriority.indexOf(leftExtension) - videoPriority.indexOf(rightExtension);
        return priorityDifference || left.localeCompare(right);
      })[0];
    return video ? `/homepage_reel/${encodeURIComponent(video)}` : null;
  } catch {
    return null;
  }
}

function homepageReelPlugin(): Plugin {
  const reelDirectory = path.resolve(process.cwd(), 'public', 'homepage_reel');
  const refresh = (server: { ws: { send: (message: { type: string }) => void } }, filePath: string) => {
    if (path.dirname(path.resolve(filePath)) === reelDirectory) {
      server.ws.send({ type: 'full-reload' });
    }
  };

  return {
    name: 'mmvp-homepage-reel',
    resolveId(id) {
      return id === homepageReelModule ? resolvedHomepageReelModule : undefined;
    },
    async load(id) {
      if (id !== resolvedHomepageReelModule) return undefined;
      return `export default ${JSON.stringify(await findHomepageReel(process.cwd()))};`;
    },
    configureServer(server) {
      server.watcher.add(reelDirectory);
      server.watcher.on('add', (filePath) => refresh(server, filePath));
      server.watcher.on('unlink', (filePath) => refresh(server, filePath));
    },
  };
}

// macOS Seatbelt blocks FSEvents, so Codex previews need polling for HMR.
const isCodexSeatbeltSandbox = process.env.CODEX_SANDBOX === 'seatbelt';

const localBindingConfig = {
  main: 'vinext/server/app-router-entry',
  compatibility_flags: ['nodejs_compat'],
  d1_databases: d1
    ? [
        {
          binding: d1,
          database_name: 'site-creator-d1',
          database_id: SITE_CREATOR_PLACEHOLDER_DATABASE_ID,
        },
      ]
    : [],
  r2_buckets: r2
    ? [
        {
          binding: r2,
          bucket_name: 'site-creator-r2',
        },
      ]
    : [],
};

export default defineConfig(async () => {
  // Keep Wrangler and Miniflare state project-local. These are non-secret tool
  // settings; application environment belongs in ignored `.env*` files.
  process.env.WRANGLER_WRITE_LOGS ??= 'false';
  process.env.WRANGLER_LOG_PATH ??= '.wrangler/logs';
  process.env.MINIFLARE_REGISTRY_PATH ??= '.wrangler/registry';

  // Wrangler snapshots its log path while the Cloudflare plugin is imported.
  const { cloudflare } = await import('@cloudflare/vite-plugin');

  return {
    css: { postcss: { plugins: [tailwindcss()] } },
    server: isCodexSeatbeltSandbox
      ? { watch: { useFsEvents: false, usePolling: true } }
      : undefined,
    plugins: [
      homepageReelPlugin(),
      vinext(),
      sites(),
      cloudflare({
        viteEnvironment: { name: 'rsc', childEnvironments: ['ssr'] },
        config: localBindingConfig,
      }),
    ],
  };
});
