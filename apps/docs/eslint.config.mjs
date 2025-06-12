import { config } from '@repo/eslint-config/base';
import { fileURLToPath, URL } from 'url';
import { includeIgnoreFile } from '@eslint/compat';

const gitignorePath = fileURLToPath(new URL('.gitignore', import.meta.url));

/** @type {import("eslint").Linter.Config} */
export default [includeIgnoreFile(gitignorePath, 'Imported .gitignore patterns'), ...config];
