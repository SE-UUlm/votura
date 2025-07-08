import type { OpenAPIV3 } from 'openapi-types';
import {
  insertableElectionObjectSchema,
  selectableElectionObjectSchema,
} from '../../objects/election.js';
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

export const electionsPathObject: OpenAPIV3.PathItemObject = {
  summary: 'Create and read elections',
  description:
    'A election is always at least linked to one user. You can create a new one ore read the existing ones.',
  get: {
    tags: [Tag.elections],
    summary: 'Get all elections',
    description:
      'Returns all elections with the public information fields, that are linked to user of the API access token.',
    security: [{ [SecuritySchemaName.voturaBackendAuth]: [] }],
    operationId: 'getElections',
    responses: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      200: {
        description:
          'OK. The request was successfully executed. Returns elections for the requested user.',
        content: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          'application/json': {
            schema: {
              type: 'array',
              // minItems: 0,
              // maxItems: 100,
              uniqueItems: true,
              items: selectableElectionObjectSchema as OpenAPIV3.SchemaObject,
            },
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
  post: {
    tags: [Tag.elections],
    summary: 'Create a new election',
    description: 'Creates a new election with a link to the user of the API access token.',
    security: [{ [SecuritySchemaName.voturaBackendAuth]: [] }],
    operationId: 'createElection',
    requestBody: {
      required: true,
      content: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'application/json': {
          schema: insertableElectionObjectSchema as OpenAPIV3.SchemaObject,
        },
      },
    },
    responses: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      201: {
        description:
          'Created. The request was successfully executed. Successfully created a new election.',
        content: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          'application/json': {
            schema: selectableElectionObjectSchema as OpenAPIV3.SchemaObject,
          },
        },
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
