import type { OpenAPIV3 } from 'openapi-types';
import { changePasswordUserObjectSchema } from '../../objects/user.js';
import {
  response400,
  response401,
  response406,
  response415,
  response429,
  responseDefault,
} from '../globals/responses.js';
import { SecuritySchemaName } from '../globals/securitySchemaName.js';
import { Tag } from '../globals/tag.js';

export const changePasswordPathObject: OpenAPIV3.PathItemObject = {
  summary: 'Change user password',
  description: 'Change user password whilst logged in.',
  post: {
    tags: [Tag.users],
    summary: 'Change user password',
    description: 'Changes the password of the currently authenticated user.',
    security: [{ [SecuritySchemaName.voturaBackendAuth]: [] }],
    operationId: 'changePassword',
    requestBody: {
      required: true,
      content: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'application/json': {
          schema: changePasswordUserObjectSchema as OpenAPIV3.SchemaObject,
        },
      },
    },
    responses: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      204: {
        description:
          'No Content. The request was successfully executed. Password successfully changed.',
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
