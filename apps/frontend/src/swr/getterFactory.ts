import type { ZodType } from 'zod/v4';
import { getter } from './getter.ts';

export type GetterFactory = <T>(
  schema: ZodType<T>,
) => (url: Parameters<typeof getter>[0]) => Promise<T>;

export const getterFactory: GetterFactory = (schema) => {
  return async (url) => {
    const response = await getter(url);
    const parsed = await schema.safeParseAsync(response);

    if (!parsed.success) {
      throw new TypeError('Parsing of the response failed.');
    }

    return parsed.data;
  };
};
