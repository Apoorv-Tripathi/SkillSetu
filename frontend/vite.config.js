import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
  css: {
    preprocessorOptions: {
      scss: {
        // Bootstrap 5.3's own SCSS still uses the legacy @import API, which
        // newer Dart Sass warns about loudly. Harmless — just noise. This
        // silences it without touching Bootstrap's source.
        quietDeps: true,
        silenceDeprecations: ["import", "global-builtin", "color-functions", "if-function", "legacy-js-api"],
      },
    },
  },
});
