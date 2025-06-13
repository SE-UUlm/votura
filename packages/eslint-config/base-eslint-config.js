import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import turboPlugin from 'eslint-plugin-turbo';
import tseslint from 'typescript-eslint';
import json from '@eslint/json';

export const config = tseslint.config(
  js.configs.recommended,
  tseslint.configs.recommended,
  {
    ignores: ['package-lock.json'],
    plugins: {
      json,
    },
  },
  {
    plugins: {
      turbo: turboPlugin,
    },
    rules: {
      'turbo/no-undeclared-env-vars': 'warn',
    },
  },
  {
    ignores: ['dist/**', 'build/**', 'coverage/**'],
  },
  eslintConfigPrettier,
);
