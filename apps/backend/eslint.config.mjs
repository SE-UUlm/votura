import { includeIgnoreFile } from '@eslint/compat';
import config from '@repo/eslint-config/node';
import tseslint from 'typescript-eslint';
import { fileURLToPath } from 'url';

const gitignorePath = fileURLToPath(new URL('.gitignore', import.meta.url));

export default tseslint.config(
  {
    files: ['**/*.ts'],
    ignores: ['**/*.json'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  includeIgnoreFile(gitignorePath, 'Imported .gitignore patterns'),
  ...config,
);
