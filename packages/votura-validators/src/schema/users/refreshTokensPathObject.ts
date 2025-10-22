import type { OpenAPIV3 } from 'openapi-types';
import { apiTokenUserObjectSchema, refreshRequestUserObjectSchema } from '../../objects/user.js';
import {
  response400,
  response401,
  response406,
  response415,
  response429,
  responseDefault,
} from '../globals/responses.js';
import { Tag } from '../globals/tag.js';

export const refreshTokensPathObject: OpenAPIV3.PathItemObject = {
  summary: 'Refresh jwt tokens',
  description: 'Refresh jwt tokens used for authentication and authorization.',
  post: {
    tags: [Tag.users],
    summary: 'Refresh jwt tokens',
    description: 'Refresh jwt tokens used for authentication and authorization.',
    security: [],
    operationId: 'refreshUserTokens',
    requestBody: {
      required: true,
      content: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'application/json': {
          schema: refreshRequestUserObjectSchema as OpenAPIV3.SchemaObject,
        },
      },
    },
    responses: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      200: {
        description: 'OK. The request was successfully executed. New tokens returned.',
        content: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
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
