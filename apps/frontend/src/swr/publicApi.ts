import axios from 'axios';
import { apiRoutes } from './apiRoutes.ts';

/**
 * Axios instance for endpoints that are reachable without being logged in.
 *
 * Unlike `api` it has no auth refresh interceptor. That interceptor reacts to
 * every 401 and, when no tokens are stored, rejects with a plain `Error`
 * instead of the `AxiosError`. A view could then neither recognize the 401 nor
 * rely on the global error handler in `main.tsx`, which only reacts to axios
 * errors. Endpoints that answer 401 as part of their contract, such as the
 * password reset with an expired token, therefore have to bypass it.
 */
export const publicApi = axios.create({
  baseURL: apiRoutes.base,
});
