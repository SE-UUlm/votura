import type { OpenAPIV3 } from 'openapi-types';
import { passwordResetUserObjectSchema } from '../../objects/user.js';
import {
  response400,
  response401,
  response406,
  response415,
  response429,
  responseDefault,
} from '../globals/responses.js';
import { Tag } from '../globals/tag.js';

export const resetPasswordPathObject: OpenAPIV3.PathItemObject = {
  summary: 'Reset user password with token',
  description: 'Reset user password with token provided to the user via email.',
  post: {
    tags: [Tag.users],
    summary: 'Reset user password with token',
    description:
      'Reset user password with the raw token provided to the user via email. ' +
      'The request must contain the reset token and the new password.',
    security: [],
    operationId: 'userPasswordReset',
    requestBody: {
      required: true,
      content: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'application/json': {
          schema: passwordResetUserObjectSchema as OpenAPIV3.SchemaObject,
        },
      },
    },
    responses: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      204: {
        description: 'OK. The request was successfully executed. Password successfully reset.',
      },
      ...response400,
      ...response401,
      ...response406,
      ...response415,
      ...response429,
      ...responseDefault,
    },
  },
};
