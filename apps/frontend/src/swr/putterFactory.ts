import type { ZodType } from 'zod/v4';
import { putter } from './putter.ts';

export type PutterFactory = <T, R>(
  responseSchema: ZodType<R>,
) => (
  url: Parameters<typeof putter>[0],
  args: {
    arg: T;
  },
) => Promise<R>;

export const posterFactory: PutterFactory = (responseSchema) => {
  return async (url, args) => {
    const response = await putter(url, args);
    const parsed = await responseSchema.safeParseAsync(response);

    if (!parsed.success) {
      throw new TypeError('Parsing of the response failed.');
    }

    return parsed.data;
  };
};
