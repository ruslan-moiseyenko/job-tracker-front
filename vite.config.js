import { sentryVitePlugin } from '@sentry/vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';
import viteReact from '@vitejs/plugin-react';

import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const __dirname = dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    TanStackRouterVite({ autoCodeSplitting: true }),
    viteReact(),
    tailwindcss(),
    sentryVitePlugin({
      org: 'moiseyenko',
      project: 'javascript-react'
    })
  ],

  test: {
    globals: true,
    environment: 'jsdom'
  },

  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  },

  build: {
    sourcemap: true
  }
});
