import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  root: resolve(__dirname, "src/webview"),
  build: {
    outDir: resolve(__dirname, "dist/webview"),
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(__dirname, "src/webview/index.html"),
      output: {
        entryFileNames: "assets/[name].js",
        chunkFileNames: "assets/[name].js",
        assetFileNames: "assets/[name].[ext]",
      },
    },
  },
  css: {
    postcss: resolve(__dirname, "postcss.config.cjs"),
  },
});
