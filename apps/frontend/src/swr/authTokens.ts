export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

const AUTH_LOCAL_STORAGE_KEY = 'authTokens';

export const setAuthLocalStorage = (obj: AuthTokens): void => {
  localStorage.setItem(AUTH_LOCAL_STORAGE_KEY, JSON.stringify(obj));
};

export const getAuthLocalStorage = (): AuthTokens | null => {
  const storage = localStorage.getItem(AUTH_LOCAL_STORAGE_KEY);

  if (storage === null) {
    return null;
  }

  return JSON.parse(storage) as AuthTokens;
};

export const clearAuthLocalStorage = (): void => {
  localStorage.removeItem(AUTH_LOCAL_STORAGE_KEY);
};

export const getUserIdFromAuthLocalStorage = (): string | null => {
  const tokens = getAuthLocalStorage();
  if (tokens?.accessToken == null) {
    return null;
  }

  try {
    const payloadBase64 = tokens.accessToken.split('.')[1];
    if (!payloadBase64) {
      return null;
    }
    let base64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
    const pad = base64.length % 4;
    if (pad) {
      base64 += '='.repeat(4 - pad);
    }
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );
    const payload = JSON.parse(jsonPayload) as { sub?: string };
    return payload.sub ?? null;
  } catch {
    return null;
  }
};
