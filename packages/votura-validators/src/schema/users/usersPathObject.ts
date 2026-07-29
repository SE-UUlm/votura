import type { OpenAPIV3 } from 'openapi-types';
import { insertableUserObjectSchema, selectableUserObjectSchema } from '../../objects/user.js';
import {
  response400,
  response401,
  response406,
  response409,
  response415,
  response429,
  responseDefault,
} from '../globals/responses.js';
import { SecuritySchemaName } from '../globals/securitySchemaName.js';
import { Tag } from '../globals/tag.js';

export const usersPathObject: OpenAPIV3.PathItemObject = {
  summary: 'Creating, reading and deleting a user',
  description: 'Creating, reading and deleting a user in the votura backend.',
  post: {
    tags: [Tag.users],
    summary: 'Create a new user',
    description: 'Creates a new user in the votura backend.',
    security: [],
    operationId: 'createUser',
    requestBody: {
      required: true,
      content: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'application/json': {
          schema: insertableUserObjectSchema as OpenAPIV3.SchemaObject,
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
      ...response406,
      ...response409,
      ...response415,
      ...response429,
      ...responseDefault,
    },
  },
  get: {
    tags: [Tag.users],
    summary: 'Get user details',
    description: 'Returns account details of the requesting user.',
    security: [{ [SecuritySchemaName.voturaBackendAuth]: [] }],
    operationId: 'getUser',
    responses: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      200: {
        description:
          'OK. The request was successfully executed. Returns account details for the requested user.',
        content: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          'application/json': {
            schema: selectableUserObjectSchema as OpenAPIV3.SchemaObject,
          },
        },
      },
      ...response400,
      ...response401,
      ...response406,
      ...response429,
      ...responseDefault,
    },
  },
  delete: {
    tags: [Tag.users],
    summary: 'Delete a user',
    description:
      'Deletes a user in the votura backend.\n' +
      'Be aware that deleting a user will also trigger a deletion of all associated elections.',
    security: [{ [SecuritySchemaName.voturaBackendAuth]: [] }],
    operationId: 'deleteUser',
    responses: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      204: {
        description:
          'No Content. The request was successfully executed. The user account was deleted.',
      },
      ...response400,
      ...response401,
      ...response406,
      ...response429,
      ...responseDefault,
    },
  },
};
