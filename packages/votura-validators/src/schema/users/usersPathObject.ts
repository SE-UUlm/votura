import type { OpenAPIV3 } from 'openapi-types';
import { insertableUserObjectSchema } from '../../objects/user.js';
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
  summary: 'Creating and deleting a user',
  description: 'Creating and deleting a user in the votura backend.',
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
  delete: {
    tags: [Tag.users],
    summary: 'Delete a user',
    description:
      'Deletes a user in the votura backend.\n' +
      'Be aware that deleting a user will also trigger a deletion of all associated elections.\n' +
      '\n' +
      'This endpoint is currently only a draft and not implemented!\n' +
      'When this endpoint is implemented this note will be removed.',
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
      ...response415,
      ...response429,
      ...responseDefault,
    },
  },
};
