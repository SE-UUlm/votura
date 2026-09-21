interface RuntimeConfig {
  backendBaseUrl?: string;
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __VOTURA_CONFIG__?: RuntimeConfig;
  }
}

export const backendBaseUrl =
  // eslint-disable-next-line @typescript-eslint/naming-convention
  window.__VOTURA_CONFIG__?.backendBaseUrl ??
  import.meta.env.BACKEND_BASE_URL ??
  'http://localhost:4000';
