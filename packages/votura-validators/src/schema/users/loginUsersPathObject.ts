import { OpenAPIV3 } from 'openapi-types';
import { Tag } from '../globals/tag.js';
import { ApiTokenUserObjectSchema, InsertableUserObjectSchema } from '../../objects/user.js';
import {
  response400,
  response401,
  response403,
  response406,
  response415,
  response429,
  responseDefault,
} from '../globals/responses.js';

export const loginUsersPathObject: OpenAPIV3.PathItemObject = {
  summary: 'Login a user',
  description: 'Login a user with the given credentials.',
  post: {
    tags: [Tag.Users],
    summary: 'Login a user',
    description: 'Login a user with the given credentials.',
    security: [],
    operationId: 'loginUser',
    requestBody: {
      content: {
        'application/json': {
          schema: InsertableUserObjectSchema as OpenAPIV3.SchemaObject,
        },
      },
    },
    responses: {
      200: {
        description: 'OK. The request was successfully executed. User was verified.',
        content: {
          'application/json': {
            schema: ApiTokenUserObjectSchema as OpenAPIV3.SchemaObject,
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
