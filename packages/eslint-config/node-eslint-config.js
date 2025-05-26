import { defineConfig } from 'eslint/config';
import { config as baseConfig } from './base-eslint-config.js';
import globals from 'globals';

export const config = defineConfig([
  ...baseConfig,
  {
    files: ['**/*.{js,mjs,cjs,ts}'],
    languageOptions: { globals: globals.node },
  },
]);
