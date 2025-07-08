import type { OpenAPIV3 } from 'openapi-types';
import {
  insertableCandidateObjectSchema,
  selectableCandidateObjectSchema,
} from '../../objects/candidate.js';
import { electionIdParameter } from '../elections/electionIdParameter.js';
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

export const candidatesPathObject: OpenAPIV3.PathItemObject = {
  summary: 'Create and read candidates',
  description:
    'A candidate is always linked to one election and can be linked to several ballot paper sections.\n' +
    'You can create a new one or read all the existing ones for an election.',
  parameters: [electionIdParameter],
  post: {
    tags: [Tag.candidates],
    summary: 'Create a candidate',
    description:
      'Creates a candidate with a link to a ballot paper sections.\n' +
      'The user of the API access token needs access to the linked election.\n' +
      'The candidate can only be created if the linked election is not frozen.\n' +
      '\n' +
      'This endpoint is currently only a draft and not implemented!\n' +
      'When this endpoint is implemented this note will be removed.',
    security: [{ [SecuritySchemaName.voturaBackendAuth]: [] }],
    operationId: 'createCandidate',
    requestBody: {
      required: true,
      content: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'application/json': {
          schema: insertableCandidateObjectSchema as OpenAPIV3.SchemaObject,
        },
      },
    },
    responses: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      201: {
        description:
          'Created. The request was successfully executed. Successfully created a new candidate.',
        content: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          'application/json': {
            schema: selectableCandidateObjectSchema as OpenAPIV3.SchemaObject,
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
    tags: [Tag.candidates],
    summary: 'Get all candidates for an election',
    description:
      'Returns all candidates with the public information fields, that are linked to the specified election. \n' +
      'The user of the API access token needs the access rights to the election to read the candidate.\n' +
      '\n' +
      'This endpoint is currently only a draft and not implemented!\n' +
      'When this endpoint is implemented this note will be removed.',
    security: [{ [SecuritySchemaName.voturaBackendAuth]: [] }],
    operationId: 'getCandidates',
    responses: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      200: {
        description:
          'OK. The request was successfully executed. Returns candidates for the requested election.',
        content: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          'application/json': {
            schema: {
              type: 'array',
              minItems: 0,
              uniqueItems: true,
              items: selectableCandidateObjectSchema as OpenAPIV3.SchemaObject,
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
