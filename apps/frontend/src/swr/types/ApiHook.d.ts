import type { SWRResponse } from 'swr';

export type ApiHookResponse<T> = SWRResponse<T, TypeError | undefined>;

export interface ApiHookOptions {
  skipFetch?: boolean;
}

export type ParametrizedApiHook<P, R> = (params: P, options?: ApiHookOptions) => ApiHookResponse<R>;

export type ApiHook<R> = (options?: ApiHookOptions) => ApiHookResponse<R>;
