import type { OpenAPIV3 } from 'openapi-types';
import { apiTokenUserObjectSchema, insertableUserObjectSchema } from '../../objects/user.js';
import {
  response400,
  response401,
  response403,
  response406,
  response415,
  response429,
  responseDefault,
} from '../globals/responses.js';
import { Tag } from '../globals/tag.js';

export const loginPathObject: OpenAPIV3.PathItemObject = {
  summary: 'Login a user',
  description: 'Login a user with the given credentials.',
  post: {
    tags: [Tag.users],
    summary: 'Login a user',
    description: 'Login a user with the given credentials.',
    security: [],
    operationId: 'loginUser',
    requestBody: {
      content: {
        'application/json': {
          schema: insertableUserObjectSchema as OpenAPIV3.SchemaObject,
        },
      },
    },
    responses: {
      200: {
        description: 'OK. The request was successfully executed. User was verified.',
        content: {
          'application/json': {
            schema: apiTokenUserObjectSchema as OpenAPIV3.SchemaObject,
          },
        },
      },
      ...response400,
      ...response401,
      ...response403,
      ...response406,
      ...response415,
      ...response429,
      ...responseDefault,
    },
  },
};
