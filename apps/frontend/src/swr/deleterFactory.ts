import type { ZodType } from 'zod/v4';
import { deleter } from './deleter.ts';

export type DeleterFactory = <T>(
  responseSchema?: ZodType<T>,
) => (url: Parameters<typeof deleter>[0]) => Promise<T>;

export const deleterFactory: DeleterFactory = <T = void>(responseSchema?: ZodType<T>) => {
  return async (url) => {
    const response = await deleter(url);
    if (!responseSchema) {
      return response as T;
    }
    const parsed = await responseSchema.safeParseAsync(response);

    if (!parsed.success) {
      throw new TypeError('Parsing of the response failed.');
    }

    return parsed.data;
  };
};
