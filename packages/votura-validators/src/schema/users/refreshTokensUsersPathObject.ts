import { OpenAPIV3 } from 'openapi-types';
import { Tag } from '../globals/tag.js';
import { ApiTokenUserObjectSchema, RefreshRequestUserObjectSchema } from '../../objects/user.js';
import {
  response400,
  response401,
  response406,
  response415,
  response429,
  responseDefault,
} from '../globals/responses.js';

export const refreshTokensUsersPathObject: OpenAPIV3.PathItemObject = {
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
          schema: RefreshRequestUserObjectSchema as OpenAPIV3.SchemaObject,
        },
      },
    },
    responses: {
      200: {
        description: 'OK. The request was successfully executed. New tokens returned.',
        content: {
          'application/json': {
            schema: ApiTokenUserObjectSchema as OpenAPIV3.SchemaObject,
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
