import type { OpenAPIV3 } from 'openapi-types';
import { Tag } from '../globals/tag.js';
import { apiTokenUserObjectSchema, refreshRequestUserObjectSchema } from '../../objects/user.js';
import {
  response400,
  response401,
  response406,
  response415,
  response429,
  responseDefault,
} from '../globals/responses.js';

export const refreshTokensPathObject: OpenAPIV3.PathItemObject = {
  summary: 'Refresh jwt tokens',
  description: 'Refresh jwt tokens used for authentication and authorization.',
  post: {
    tags: [Tag.Users],
    summary: 'Refresh jwt tokens',
    description: 'Refresh jwt tokens used for authentication and authorization.',
    security: [],
    operationId: 'refreshUserTokens',
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: refreshRequestUserObjectSchema as OpenAPIV3.SchemaObject,
        },
      },
    },
    responses: {
      200: {
        description: 'OK. The request was successfully executed. New tokens returned.',
        content: {
          'application/json': {
            schema: apiTokenUserObjectSchema as OpenAPIV3.SchemaObject,
          },
        },
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
