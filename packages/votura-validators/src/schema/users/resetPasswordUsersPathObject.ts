import { OpenAPIV3 } from 'openapi-types';
import { Tag } from '../globals/tag.js';
import { PasswordResetUserObjectSchema } from '../../objects/user.js';
import {
  response400,
  response401,
  response406,
  response415,
  response429,
  responseDefault,
} from '../globals/responses.js';

export const resetPasswordUsersPathObject: OpenAPIV3.PathItemObject = {
  summary: 'Reset user password with token',
  description: 'Reset user password with token provided to the user via email.',
  post: {
    tags: [Tag.Users],
    summary: 'Reset user password with token',
    description:
      'Reset user password with token provided to the user via email.\n' +
      '\n' +
      'This endpoint is currently only a draft and not implemented!\n' +
      'When this endpoint is implemented this note will be removed.',
    security: [],
    operationId: 'userPasswordReset',
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: PasswordResetUserObjectSchema as OpenAPIV3.SchemaObject,
        },
      },
    },
    responses: {
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
