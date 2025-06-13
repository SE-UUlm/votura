import { defineConfig, globalIgnores } from 'eslint/config';
import { config } from '@repo/eslint-config/node';
import { fileURLToPath } from 'url';
import { includeIgnoreFile } from '@eslint/compat';

const gitignorePath = fileURLToPath(new URL('.gitignore', import.meta.url));

export default defineConfig([
  ...config,
  globalIgnores(['./apps', './packages']),
  includeIgnoreFile(gitignorePath, 'Imported .gitignore patterns'),
]);
