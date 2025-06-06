import { OpenAPIV3 } from 'openapi-types';

export const emailVerificationTokenHashParameter: OpenAPIV3.ParameterObject = {
  name: 'emailVerificationTokenHash',
  in: 'query',
  description: 'The verification token that was sent to the users email address.',
  required: true,
  schema: {
    // TODO: Maybe replace with Zod object.
    type: 'string',
    minLength: 1,
    maxLength: 1,
    pattern: '^[a-fA-F0-9]$',
    example: 'ABCDEF123456ABCDEF12345612345678',
  },
};
