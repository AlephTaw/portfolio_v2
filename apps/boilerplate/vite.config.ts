import tailwindcss from "@tailwindcss/postcss";
import vinext from "vinext";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [vinext()],
  css: { postcss: { plugins: [tailwindcss()] } },
  server: {
    host: "0.0.0.0",
    port: 3009,
    strictPort: true,
    ...(process.env.CODEX_SANDBOX === "seatbelt"
      ? { watch: { useFsEvents: false, usePolling: true } }
      : {}),
  },
});
