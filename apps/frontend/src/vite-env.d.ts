/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly viteAppTitle: string;
  readonly BACKEND_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
