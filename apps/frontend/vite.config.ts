import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import istanbul from 'vite-plugin-istanbul';

const enableCoverage = process.env.VITE_COVERAGE === 'true';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    istanbul({
      include: 'src/**/*.{ts,tsx}',
      exclude: ['node_modules', 'test/', '**/*.test.ts', '**/*.test.tsx'],
      extension: ['.ts', '.tsx'],
      requireEnv: true,
      forceBuildInstrument: true,
    }),
  ],
  server: {
    port: 5173,
  },
  preview: {
    port: 5173,
  },
  build: {
    sourcemap: enableCoverage,
  },
});
