import { defineConfig, passthroughImageService } from "astro/config";
import react from "@astrojs/react";
import cloudflare from "@astrojs/cloudflare";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://ridebonk.com",
  output: "server",
  adapter: cloudflare({ platformProxy: { enabled: true } }),
  integrations: [react(), sitemap()],
  image: { service: passthroughImageService() },
  vite: {
    plugins: [tailwindcss()],
  },
});
