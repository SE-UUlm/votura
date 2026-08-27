import type { OpenAPIV3 } from 'openapi-types';
import { editUserDataObjectSchema, selectableUserObjectSchema } from '../../objects/user.js';
import {
  response400,
  response401,
  response403,
  response404,
  response406,
  response409,
  response415,
  response429,
  responseDefault,
} from '../globals/responses.js';
import { SecuritySchemaName } from '../globals/securitySchemaName.js';
import { Tag } from '../globals/tag.js';
import { userIdParameter } from './userIdParameter.js';

export const userDetailsPathObject: OpenAPIV3.PathItemObject = {
  summary: 'Modifying, reading and deleting users',
  description: 'Modifying, reading and deleting users in the votura backend.',
  parameters: [userIdParameter],
  post: {
    tags: [Tag.users],
    summary: 'Modify a user',
    description: 'Modifies a user in the votura backend.',
    security: [
      { [SecuritySchemaName.voturaBackendAuth]: [], [SecuritySchemaName.voturaOnlyAdmin]: [] },
    ],
    operationId: 'editUser',
    requestBody: {
      required: true,
      content: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'application/json': {
          schema: editUserDataObjectSchema as OpenAPIV3.SchemaObject,
        },
      },
    },
    responses: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      204: {
        description:
          'Modified. The request was successfully executed. Successfully modified the user.',
      },
      ...response400,
      ...response403,
      ...response404,
      ...response406,
      ...response409,
      ...response415,
      ...response429,
      ...responseDefault,
    },
  },
  get: {
    tags: [Tag.users],
    summary: 'Get details of the user',
    description: 'Returns account details for the user.',
    security: [
      { [SecuritySchemaName.voturaBackendAuth]: [], [SecuritySchemaName.voturaOnlyAdmin]: [] },
    ],
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
      ...response403,
      ...response404,
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
    security: [
      { [SecuritySchemaName.voturaBackendAuth]: [], [SecuritySchemaName.voturaOnlyAdmin]: [] },
    ],
    operationId: 'deleteUser',
    responses: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      204: {
        description:
          'No Content. The request was successfully executed. The user account was deleted.',
      },
      ...response400,
      ...response401,
      ...response404,
      ...response406,
      ...response429,
      ...responseDefault,
    },
  },
};
