import type { ZodType } from 'zod/v4';
import { publicPoster } from './publicPoster.ts';

export type PublicPosterFactory = <T, R = void>(
  responseSchema?: ZodType<R>,
) => (
  url: Parameters<typeof publicPoster>[0],
  args: {
    arg: T;
  },
) => Promise<R>;

export const publicPosterFactory: PublicPosterFactory = <T, R = void>(
  responseSchema?: ZodType<R>,
) => {
  return async (url: Parameters<typeof publicPoster>[0], args: { arg: T }) => {
    const response = await publicPoster(url, args);
    if (!responseSchema) {
      return response as R;
    }
    const parsed = await responseSchema.safeParseAsync(response);

    if (!parsed.success) {
      throw new TypeError('Parsing of the response failed.');
    }

    return parsed.data;
  };
};
