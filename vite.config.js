import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";

// https://vite.dev/config/
export default defineConfig({
  base: "/hypomap/",
  plugins: [vue(), vueDevTools()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    host: "0.0.0.0",
    port: 9121,
    allowedHosts: ["bmblx.bmi.osumc.edu"],
  },
  preview: {
    host: "0.0.0.0",
    port: 9121,
    allowedHosts: ["bmblx.bmi.osumc.edu"],
  },
  dev: {
    host: "0.0.0.0",
    port: 9121,
  },
});
