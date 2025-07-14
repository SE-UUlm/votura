import { apiTokenUserObject } from '@repo/votura-validators';
import axios, { type AxiosRequestConfig } from 'axios';
import createAuthRefreshInterceptor from 'axios-auth-refresh';
import { apiRoutes } from './apiRoutes.ts';
import { clearAuthLocalStorage, getAuthLocalStorage } from './authTokens.ts';

interface FailedRequest {
  response: {
    config: AxiosRequestConfig;
  };
}

export const api = axios.create({
  baseURL: apiRoutes.base,
});

createAuthRefreshInterceptor(api, async (failedRequest: FailedRequest) => {
  const authToken = getAuthLocalStorage();

  if (!authToken) {
    clearAuthLocalStorage();
    return;
  }

  const response = await api.post(
    apiRoutes.users.refreshTokens,
    {
      refreshToken: authToken.refreshToken,
    },
    {
      headers: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        Authorization: `Bearer ${authToken.accessToken}`,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'Content-Type': 'application/json',
      },
    },
  );

  const parsed = await apiTokenUserObject.safeParseAsync(response.data);

  if (!parsed.success) {
    throw new Error('Corrupted token refresh request body');
  }

  failedRequest.response.config.headers = {
    ...failedRequest.response.config.headers,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    Authorization: `Bearer ${parsed.data.accessToken}`,
  };

  return Promise.resolve();
});
