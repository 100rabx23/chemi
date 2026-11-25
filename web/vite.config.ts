import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const api = process.env.VITE_API_PROXY ?? 'http://localhost:4000';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { port: 5173, proxy: { '/api': api, '/uploads': api } },
  preview: { port: 4173, proxy: { '/api': api, '/uploads': api } },
  test: { environment: 'node' },
});
