import { apiTokenUserObject } from '@repo/votura-validators';
import axios, { type AxiosRequestConfig } from 'axios';
import type axiosAuthRefresh from 'axios-auth-refresh';
import * as axiosAuthRefreshModule from 'axios-auth-refresh';
import { browserRouter } from '../browserRouter.ts';
import { apiRoutes } from './apiRoutes.ts';
import { clearAuthLocalStorage, getAuthLocalStorage, setAuthLocalStorage } from './authTokens.ts';

type AuthRefreshInterceptor = typeof axiosAuthRefresh;
type AuthRefreshExport = AuthRefreshInterceptor | { default: AuthRefreshInterceptor };

const authRefreshExport = axiosAuthRefreshModule.default as AuthRefreshExport;
const createAuthRefreshInterceptor =
  typeof authRefreshExport === 'function' ? authRefreshExport : authRefreshExport.default;

interface FailedRequest {
  response: {
    config: AxiosRequestConfig;
  };
}

export const api = axios.create({
  baseURL: apiRoutes.base,
});

export const refreshApi = axios.create({
  baseURL: apiRoutes.base,
});

createAuthRefreshInterceptor(api, async (failedRequest: FailedRequest) => {
  const authToken = getAuthLocalStorage();

  if (!authToken) {
    clearAuthLocalStorage();
    return Promise.reject(new Error('Failed to get auth tokens from local storage.'));
  }

  const response = await refreshApi.post(
    apiRoutes.users.refreshTokens,
    {
      refreshToken: authToken.refreshToken,
    },
    {
      headers: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'Content-Type': 'application/json',
      },
    },
  );

  const parsed = await apiTokenUserObject.safeParseAsync(response.data);

  if (!parsed.success) {
    clearAuthLocalStorage();
    return Promise.reject(parsed.error);
  }

  setAuthLocalStorage(parsed.data);

  failedRequest.response.config.headers = {
    ...failedRequest.response.config.headers,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    Authorization: `Bearer ${parsed.data.accessToken}`,
  };

  return Promise.resolve();
});

createAuthRefreshInterceptor(refreshApi, async () => {
  try {
    clearAuthLocalStorage();
    await browserRouter.navigate('/login');
    return Promise.resolve();
  } catch {
    return Promise.reject(new Error());
  }
});
