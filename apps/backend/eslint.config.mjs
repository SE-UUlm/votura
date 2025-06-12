import { config } from '@repo/eslint-config/node';
import { fileURLToPath } from 'url';
import { includeIgnoreFile } from '@eslint/compat';

const gitignorePath = fileURLToPath(new URL('.gitignore', import.meta.url));

export default [includeIgnoreFile(gitignorePath, 'Imported .gitignore patterns'), ...config];
