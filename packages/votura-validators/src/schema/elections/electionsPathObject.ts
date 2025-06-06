import { OpenAPIV3 } from 'openapi-types';
import {
  InsertableElectionObjectSchema,
  SelectableElectionObjectSchema,
} from '../../objects/election.js';
import { Tag } from '../globals/tag.js';
import {
  response400,
  response401,
  response406,
  response415,
  response429,
  responseDefault,
} from '../globals/responses.js';
import { SecuritySchemaName } from '../globals/securitySchemaName.js';

export const electionsPathObject: OpenAPIV3.PathItemObject = {
  summary: 'Create and read elections',
  description:
    'A election is always at least linked to one user. You can create a new one ore read the existing ones.',
  get: {
    tags: [Tag.Elections],
    summary: 'Get all elections',
    description:
      'Returns all elections with the public information fields, that are linked to user of the API access token.',
    security: [{ [SecuritySchemaName.voturaBackendAuth]: [] }],
    operationId: 'getElections',
    responses: {
      200: {
        description:
          'OK. The request was successfully executed. Returns elections for the requested user.',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              // minItems: 0,
              // maxItems: 100,
              uniqueItems: true,
              items: SelectableElectionObjectSchema as OpenAPIV3.SchemaObject,
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
    tags: [Tag.Elections],
    summary: 'Create a new election',
    description: 'Creates a new election with a link to the user of the API access token.',
    security: [{ [SecuritySchemaName.voturaBackendAuth]: [] }],
    operationId: 'createElection',
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: InsertableElectionObjectSchema as OpenAPIV3.SchemaObject,
        },
      },
    },
    responses: {
      201: {
        description:
          'Created. The request was successfully executed. Successfully created a new election.',
        content: {
          'application/json': {
            schema: SelectableElectionObjectSchema as OpenAPIV3.SchemaObject,
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
