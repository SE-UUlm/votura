import { defineConfig, globalIgnores } from 'eslint/config';
import { config } from '@repo/eslint-config/node';

export default defineConfig([...config, globalIgnores(['./apps', './packages'])]);
