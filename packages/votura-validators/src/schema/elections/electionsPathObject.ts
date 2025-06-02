import { z } from 'zod/v4';
import { OpenAPIV3 } from 'openapi-types';
import { toJsonSchemaParams } from '../utils.js';
import { SelectableElectionObject } from '../../objects/election.js';

export const SelectableElectionObjectSchema = z.toJSONSchema(
  SelectableElectionObject,
  toJsonSchemaParams,
);

export const electionsPathObject: OpenAPIV3.PathItemObject = {
  summary: 'Create and read elections',
  description:
    'A election is always at least linked to one user. You can create a new one ore read the existing ones.',
  get: {
    tags: ['Elections'],
    summary: 'Get all elections',
    description:
      'Returns all elections with the public information fields, that are linked to user of the API access token.',
    security: [{}],
    operationId: 'getElections',
    responses: {
      200: {
        description:
          'OK. The request was successfully executed. Returns elections for the requested user.',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              minItems: 0,
              maxItems: 100,
              uniqueItems: true,
              items: SelectableElectionObjectSchema as OpenAPIV3.SchemaObject,
            },
          },
        },
      },
    },
  },
};
