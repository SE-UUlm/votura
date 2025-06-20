import { defineConfig } from 'eslint/config';
import globals from 'globals';
import config from './base-eslint-config.mjs';

export default defineConfig([
  ...config,
  {
    files: ['**/*.{js,mjs,cjs,ts}'],
    languageOptions: { globals: globals.node },
  },
]);
