import type { OpenAPIV3 } from 'openapi-types';
import {
  insertableVoterGroupObjectSchema,
  selectableVoterGroupObjectSchema,
} from '../../objects/voterGroup.js';
import {
  response400,
  response401,
  response403,
  response404,
  response406,
  response415,
  response429,
  responseDefault,
} from '../globals/responses.js';
import { SecuritySchemaName } from '../globals/securitySchemaName.js';
import { Tag } from '../globals/tag.js';
import { voterGroupIdParameter } from './voterGroupIdParameter.js';

export const voterGroupIdPathObject: OpenAPIV3.PathItemObject = {
  summary: 'Manage a specific voter group',
  description: 'Read, update or delete a specific voter group.',
  parameters: [voterGroupIdParameter],
  put: {
    tags: [Tag.voterGroups],
    summary: 'Update a specific voter group',
    description:
      'Updates the configuration of the requested voter group with the provided information.\n' +
      'The user of the API access token needs access to the requested voter group and the linked ballot papers & elections.\n' +
      'The voter group can only be updated if all linked ballot papers & elections are not frozen.\n' +
      '\n' +
      'This endpoint is currently only a draft and not implemented!\n' +
      'When this endpoint is implemented this note will be removed.',
    security: [{ [SecuritySchemaName.voturaBackendAuth]: [] }],
    operationId: 'updateVoterGroupById',
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: insertableVoterGroupObjectSchema as OpenAPIV3.SchemaObject,
        },
      },
    },
    responses: {
      200: {
        description: 'OK. The request was successfully executed. The voter group was updated.',
        content: {
          'application/json': {
            schema: selectableVoterGroupObjectSchema as OpenAPIV3.SchemaObject,
          },
        },
      },
      ...response400,
      ...response401,
      ...response403,
      ...response404,
      ...response406,
      ...response415,
      ...response429,
      ...responseDefault,
    },
  },
  get: {
    tags: [Tag.voterGroups],
    summary: 'Get a specific voter group',
    description:
      'Returns the requested voter group with all public information fields.\n' +
      'The user of the API access token needs access to the voter group and all linked ballot papers & elections.\n' +
      '\n' +
      'This endpoint is currently only a draft and not implemented!\n' +
      'When this endpoint is implemented this note will be removed.',
    security: [{ [SecuritySchemaName.voturaBackendAuth]: [] }],
    operationId: 'getVoterGroupById',
    responses: {
      200: {
        description:
          'OK. The request was successfully executed. Returns the requested voter group with all public information fields.',
        content: {
          'application/json': {
            schema: selectableVoterGroupObjectSchema as OpenAPIV3.SchemaObject,
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
    tags: [Tag.voterGroups],
    summary: 'Delete a specific voter group',
    description:
      'Deletes the requested voter group.\n' +
      'The user of the API access token needs access to the voter group and all linked ballot papers & elections.\n' +
      'The voter group can only be deleted if all linked ballot papers & elections are not frozen.\n' +
      '\n' +
      'This endpoint is currently only a draft and not implemented!\n' +
      'When this endpoint is implemented this note will be removed.',
    security: [{ [SecuritySchemaName.voturaBackendAuth]: [] }],
    operationId: 'deleteVoterGroupById',
    responses: {
      204: {
        description:
          'No Content. The request was successfully executed. The voter group was deleted.',
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
};
