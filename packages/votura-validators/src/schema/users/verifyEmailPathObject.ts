import type { OpenAPIV3 } from 'openapi-types';
import {
  response400,
  response406,
  response415,
  response429,
  responseDefault,
} from '../globals/responses.js';
import { Tag } from '../globals/tag.js';
import { emailVerificationTokenHashParameter } from './emailVerificationTokenHashParameter.js';

export const verifyEmailPathObject: OpenAPIV3.PathItemObject = {
  summary: 'Verify the user',
  description: 'Verify the users email address with the given verification token.',
  get: {
    tags: [Tag.users],
    summary: 'Verify the user',
    description:
      'Verify the users email address with the given verification token.\n' +
      '\n' +
      'This endpoint is currently only a draft and not implemented!\n' +
      'When this endpoint is implemented this note will be removed.',
    security: [],
    operationId: 'verifyUser',
    parameters: [emailVerificationTokenHashParameter],
    responses: {
      200: {
        description: 'OK. The request was successfully executed. User was verified.',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              additionalProperties: false,
              properties: {
                message: {
                  type: 'string',
                  minLength: 1,
                  maxLength: 256,
                  pattern: '^[a-zA-Z0-9 .,\\-_:;!?()\\/]$',
                  example: 'The user was verified.',
                },
              },
            },
          },
        },
      },
      ...response400,
      ...response406,
      ...response415,
      ...response429,
      ...responseDefault,
    },
  },
};
