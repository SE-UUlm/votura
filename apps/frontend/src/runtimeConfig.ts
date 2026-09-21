interface RuntimeConfig {
  backendBaseUrl?: string;
}

declare global {
  interface Window {
    __VOTURA_CONFIG__?: RuntimeConfig;
  }
}

export const backendBaseUrl =
  window.__VOTURA_CONFIG__?.backendBaseUrl ??
  import.meta.env.BACKEND_BASE_URL ??
  'http://localhost:4000';
