// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  // Enable View Transitions for smooth page navigation
  experimental: {},
  vite: {
    optimizeDeps: {
      include: ['three'],
    },
  },
});
