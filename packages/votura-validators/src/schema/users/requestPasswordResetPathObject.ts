import type { OpenAPIV3 } from 'openapi-types';
import { requestPasswordResetUserObjectSchema } from '../../objects/user.js';
import { response406, response415, response429, responseDefault } from '../globals/responses.js';
import { Tag } from '../globals/tag.js';

export const requestPasswordResetPathObject: OpenAPIV3.PathItemObject = {
  summary: 'Request a password reset email',
  description: 'Request a password reset email sent to the email associated with the user account.',
  post: {
    tags: [Tag.users],
    summary: 'Request a password reset email',
    description:
      'Request a password reset email sent to the email associated with the user account.\n' +
      '\n' +
      'This endpoint is currently only a draft and not implemented!\n' +
      'When this endpoint is implemented this note will be removed.',
    security: [],
    operationId: 'requestUserPasswordReset',
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: requestPasswordResetUserObjectSchema as OpenAPIV3.SchemaObject,
        },
      },
    },
    responses: {
      204: {
        description:
          'No Content. The request was successfully executed. Email sent if user exists.',
      },
      ...response406,
      ...response415,
      ...response429,
      ...responseDefault,
    },
  },
};
