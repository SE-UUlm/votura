import type { OpenAPIV3 } from 'openapi-types';
import { setInitialPasswordDataObjectSchema } from '../../objects/user.js';
import {
  response400,
  response404,
  response406,
  response415,
  response429,
  responseDefault,
} from '../globals/responses.js';
import { SecuritySchemaName } from '../globals/securitySchemaName.js';
import { Tag } from '../globals/tag.js';

export const setInitialPasswordPathObject: OpenAPIV3.PathItemObject = {
  summary: "Set a user's initial password",
  description: "Set a user's initial password after the account was created.",
  post: {
    tags: [Tag.users],
    summary: "Set a user's initial password",
    description: "Set a user's initial password after the account was created.",
    security: [{ [SecuritySchemaName.voturaBackendAuth]: [] }],
    operationId: 'setInitialPassword',
    requestBody: {
      required: true,
      content: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'application/json': {
          schema: setInitialPasswordDataObjectSchema as OpenAPIV3.SchemaObject,
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
      ...response404,
      ...response406,
      ...response415,
      ...response429,
      ...responseDefault,
    },
  },
};
