import type { OpenAPIV3 } from 'openapi-types';
import { selectableVotingElectionObjectSchema } from '../../objects/votingElection.js';
import {
  response400,
  response401,
  response406,
  response429,
  responseDefault,
} from '../globals/responses.js';
import { SecuritySchemaName } from '../globals/securitySchemaName.js';
import { Tag } from '../globals/tag.js';

export const votingElectionsPathObject: OpenAPIV3.PathItemObject = {
  summary: 'Get all elections and ballot papers for a voter token',
  description: 'Returns all elections and ballot papers for the provided voter token.',
  get: {
    tags: [Tag.voting],
    summary: 'Get all elections and ballot papers for a voter token',
    description:
      'Returns all elections and ballot papers for the provided voter token. ' +
      'Contains all public information about the elections and ballot papers that are necessary for the voting process.\n' +
      '\n' +
      'This endpoint is currently only a draft and not implemented!\n' +
      'When this endpoint is implemented this note will be removed.',
    security: [{ [SecuritySchemaName.voturaVoterAuth]: [] }],
    operationId: 'getVotingElections',
    responses: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      200: {
        description:
          'OK. The request was successfully executed. Returns elections for the requested voter token.',
        content: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          'application/json': {
            schema: {
              type: 'array',
              minItems: 1,
              uniqueItems: true,
              items: selectableVotingElectionObjectSchema as OpenAPIV3.SchemaObject,
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
};
