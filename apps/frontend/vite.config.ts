import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  envPrefix: ['VITE_', 'BACKEND_'],
  server: {
    port: 5173,
  },
  preview: {
    port: 5173,
  },
});
