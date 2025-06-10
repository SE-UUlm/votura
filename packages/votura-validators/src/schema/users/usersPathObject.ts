import type { OpenAPIV3 } from 'openapi-types';
import { Tag } from '../globals/tag.js';
import { InsertableUserObjectSchema } from '../../objects/user.js';
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

export const usersPathObject: OpenAPIV3.PathItemObject = {
  summary: 'Creating and deleting a user',
  description: 'Creating and deleting a user in the votura backend.',
  post: {
    tags: [Tag.Users],
    summary: 'Create a new user',
    description: 'Creates a new user in the votura backend.',
    security: [],
    operationId: 'createUser',
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: InsertableUserObjectSchema as OpenAPIV3.SchemaObject,
        },
      },
    },
    responses: {
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
    tags: [Tag.Users],
    summary: 'Delete a user',
    description:
      'Deletes a user in the votura backend.\n' +
      '\n' +
      'This endpoint is currently only a draft and not implemented!\n' +
      'When this endpoint is implemented this note will be removed.',
    security: [{ [SecuritySchemaName.voturaBackendAuth]: [] }],
    operationId: 'deleteUser',
    responses: {
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
