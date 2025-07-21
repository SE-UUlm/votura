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

export const voterGroupsPathObject: OpenAPIV3.PathItemObject = {
  summary: 'Create and read ballot voter groups',
  description:
    'A voter group is always linked to at least one user and any number of ballot papers.\n' +
    'You can create a new one ore read all the existing ones for a user.',
  post: {
    tags: [Tag.voterGroups],
    summary: 'Create a voter group',
    description:
      'Creates a voter group with an optional link to any number of ballot papers.\n' +
      'The user of the API access token needs access to all linked ballot papers & elections.\n' +
      'The voter group can only be created if all elections of the linked ballot papers are not frozen.\n' +
      'The user can only link one ballot paper per election to the same voter group.\n' +
      'It is allowed to link ballot papers from different elections to the same voter group.',
    security: [{ [SecuritySchemaName.voturaBackendAuth]: [] }],
    operationId: 'createVoterGroup',
    requestBody: {
      required: true,
      content: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'application/json': {
          schema: insertableVoterGroupObjectSchema as OpenAPIV3.SchemaObject,
        },
      },
    },
    responses: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      201: {
        description:
          'Created. The request was successfully executed. Successfully created a new voter group.',
        content: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
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
    summary: 'Get all voter groups for the user',
    description:
      'Returns all voter groups with the public information fields, that are linked to the requesting user.\n' +
      'The user of the API access token needs access to all linked ballot papers & elections.',
    security: [{ [SecuritySchemaName.voturaBackendAuth]: [] }],
    operationId: 'getVoterGroups',
    responses: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      200: {
        description:
          'OK. The request was successfully executed. Returns voter groups for the requested user.',
        content: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          'application/json': {
            schema: {
              type: 'array',
              minItems: 0,
              uniqueItems: true,
              items: selectableVoterGroupObjectSchema as OpenAPIV3.SchemaObject,
            },
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
};
