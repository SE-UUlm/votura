import type { OpenAPIV3 } from 'openapi-types';
import { createUserDataObjectSchema, selectableUserObjectSchema } from '../../objects/user.js';
import {
  response400,
  response401,
  response403,
  response406,
  response409,
  response415,
  response429,
  responseDefault,
} from '../globals/responses.js';
import { SecuritySchemaName } from '../globals/securitySchemaName.js';
import { Tag } from '../globals/tag.js';

export const usersPathObject: OpenAPIV3.PathItemObject = {
  summary: 'Creating, reading and deleting users',
  description: 'Creating, reading and deleting users in the votura backend.',
  post: {
    tags: [Tag.users],
    summary: 'Create a new user',
    description: 'Creates a new user in the votura backend.',
    security: [
      { [SecuritySchemaName.voturaBackendAuth]: [], [SecuritySchemaName.voturaOnlyAdmin]: [] },
    ],
    operationId: 'createUser',
    requestBody: {
      required: true,
      content: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'application/json': {
          schema: createUserDataObjectSchema as OpenAPIV3.SchemaObject,
        },
      },
    },
    responses: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      204: {
        description:
          'Created. The request was successfully executed. Successfully created a new user. Waiting for verification.',
      },
      ...response400,
      ...response403,
      ...response406,
      ...response409,
      ...response415,
      ...response429,
      ...responseDefault,
    },
  },
  get: {
    tags: [Tag.users],
    summary: 'Get details of all users',
    description: 'Returns account details for all users. Ony usable by administrators.',
    security: [
      { [SecuritySchemaName.voturaBackendAuth]: [], [SecuritySchemaName.voturaOnlyAdmin]: [] },
    ],
    operationId: 'getUser',
    responses: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      200: {
        description:
          'OK. The request was successfully executed. Returns account details for all users.',
        content: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          'application/json': {
            schema: selectableUserObjectSchema as OpenAPIV3.SchemaObject,
          },
        },
      },
      ...response400,
      ...response401,
      ...response403,
      ...response406,
      ...response429,
      ...responseDefault,
    },
  },
};
