import tseslint from 'typescript-eslint';
import config from '@repo/eslint-config/node';
import { fileURLToPath } from 'url';
import { includeIgnoreFile } from '@eslint/compat';

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
  globalIgnores(['./apps', './packages']),
  ...config,
);
