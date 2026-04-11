import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// In dev, the Vite frontend runs on :5173 and proxies /api/* to the Express
// backend on :3000. In production, Express serves both dist/ and /api from one port.
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // allow LAN access during dev too
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
