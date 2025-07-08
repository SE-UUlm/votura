import type { OpenAPIV3 } from 'openapi-types';
import {
  response401,
  response406,
  response415,
  response429,
  responseDefault,
} from '../globals/responses.js';
import { SecuritySchemaName } from '../globals/securitySchemaName.js';
import { Tag } from '../globals/tag.js';

export const logoutPathObject: OpenAPIV3.PathItemObject = {
  summary: 'Logout user',
  description: 'Logout user (blacklist access and refresh token)',
  post: {
    tags: [Tag.users],
    summary: 'Logout user',
    description: 'Logout user (blacklist access and refresh token)',
    security: [{ [SecuritySchemaName.voturaBackendAuth]: [] }],
    operationId: 'userLogout',
    responses: {
      204: {
        description: 'No Content. The request was successfully executed. User logged out.',
      },
      ...response401,
      ...response406,
      ...response415,
      ...response429,
      ...responseDefault,
    },
  },
};
