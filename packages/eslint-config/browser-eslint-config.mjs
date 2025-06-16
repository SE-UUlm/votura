import { defineConfig } from 'eslint/config';
import config from './base-eslint-config.mjs';
import globals from 'globals';

export default defineConfig([
  ...config,
  {
    files: ['**/*.{js,mjs,cjs,ts}'],
    languageOptions: { globals: globals.browser },
  },
]);
