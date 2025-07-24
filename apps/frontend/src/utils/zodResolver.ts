import type { FormErrors, FormValidateInput } from '@mantine/form';
import { ZodError, type ZodType } from 'zod/v4';

export type ZodResolver = <S, F>(schema: ZodType<S>) => FormValidateInput<F>;

export const zodResolver: ZodResolver = (schema) => {
  return (values) => {
    try {
      schema.parse(values);

      return {};
    } catch (e) {
      if (e instanceof ZodError) {
        const results: FormErrors = {};

        e.issues.forEach((issue) => {
          results[issue.path.join('.')] = issue.message;
        });

        return results;
      }

      throw e; // rethrow if not a ZodError
    }
  };
};
