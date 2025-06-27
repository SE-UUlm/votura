import type { ZodType } from 'zod/v4';
import { poster } from './poster.ts';

export type PosterFactory = <T, R>(
  responseSchema: ZodType<R>,
) => (
  url: Parameters<typeof poster>[0],
  args: {
    arg: T;
  },
) => Promise<R>;

export const posterFactory: PosterFactory = (responseSchema) => {
  return async (url, args) => {
    const response = await poster(url, args);
    const parsed = await responseSchema.safeParseAsync(response);

    if (!parsed.success) {
      throw new TypeError('Parsing of the response failed.');
    }

    return parsed.data;
  };
};
