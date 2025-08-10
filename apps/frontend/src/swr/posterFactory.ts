import type { ZodType } from 'zod/v4';
import { poster } from './poster.ts';

export type PosterFactory = <T, R = void>(
  responseSchema?: ZodType<R>,
) => (
  url: Parameters<typeof poster>[0],
  args: {
    arg: T;
  },
) => Promise<R>;

export const posterFactory: PosterFactory = <T, R = void>(responseSchema?: ZodType<R>) => {
  return async (url: Parameters<typeof poster>[0], args: { arg: T }) => {
    const response = await poster(url, args);
    if (!responseSchema) {
      return response as unknown as R;
    }
    const parsed = await responseSchema.safeParseAsync(response);

    if (!parsed.success) {
      throw new TypeError('Parsing of the response failed.');
    }

    return parsed.data;
  };
};
