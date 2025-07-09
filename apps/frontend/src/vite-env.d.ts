/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly viteAppTitle: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
