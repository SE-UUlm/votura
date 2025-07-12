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

  if (storage === null) return null;

  return JSON.parse(storage) as AuthTokens;
};

export const clearAuthLocalStorage = (): void => {
  localStorage.removeItem(AUTH_LOCAL_STORAGE_KEY);
};
