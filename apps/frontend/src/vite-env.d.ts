/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly viteAppTitle: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  readonly BACKEND_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
