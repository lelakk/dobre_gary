import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Spring Boot backend (see server.port in src/main/resources/application.properties).
// Proxying /api keeps the frontend same-origin, so the backend needs no CORS configuration.
const BACKEND_URL = 'http://localhost:8080'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': BACKEND_URL,
    },
  },
})
