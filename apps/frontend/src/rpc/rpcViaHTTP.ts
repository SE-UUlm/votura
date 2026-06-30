import { getAuthLocalStorage } from '../swr/authTokens.ts';
import { rpcRoutes } from './rpcRoutes.ts';

export const rpcViaHTTP = async (route: string, method = 'GET'): Promise<Response | null> => {
  const endpoint = rpcRoutes.base + route;

  const authorization = getAuthLocalStorage();
  if (!authorization) {
    return null;
  }

  const headers = new Headers();
  headers.append('Authorization', 'Bearer ' + authorization.accessToken);
  headers.append('Accept', 'application/json');

  return await fetch(endpoint, {
    method,
    headers,
  });
};

export interface StatusMessagedRPCResponse {
  message: string;
  success: boolean;
}

export interface ApiErrorResponse {
  message: string;
}
