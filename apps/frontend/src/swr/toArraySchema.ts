import { z, type ZodArray, type ZodType } from 'zod/v4';

export const toArraySchema = <T>(schema: ZodType<T>): ZodArray<ZodType<T>> => {
  return z.array(schema);
};
