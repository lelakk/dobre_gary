import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Spring Boot backend (see server.port in src/main/resources/application.properties).
// Proxying /api keeps the frontend same-origin, so the backend needs no CORS configuration.
const BACKEND_URL = 'http://localhost:8080'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': BACKEND_URL,
    },
  },
  build: {
    rolldownOptions: {
      output: {
        // Third-party code changes rarely, so it goes into long-cacheable chunks of its own;
        // React is split from the rest to keep every chunk under Vite's 500 kB warning limit.
        codeSplitting: {
          groups: [
            {
              name: 'react',
              test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/,
              priority: 2,
            },
            // Form libraries are used only by the admin panel, so shoppers never download them.
            {
              name: 'forms',
              test: /node_modules[\\/](zod|react-hook-form|@hookform)[\\/]/,
              priority: 2,
            },
            { name: 'vendor', test: /node_modules/, priority: 1 },
          ],
        },
      },
    },
  },
})
