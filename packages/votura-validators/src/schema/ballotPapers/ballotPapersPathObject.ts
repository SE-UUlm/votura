import type { OpenAPIV3 } from 'openapi-types';
import {
  insertableBallotPaperObjectSchema,
  selectableBallotPaperObjectSchema,
} from '../../objects/ballotPaper.js';
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

export const ballotPapersPathObject: OpenAPIV3.PathItemObject = {
  summary: 'Get and create ballot papers',
  description:
    'A ballot paper is always linked to one election.\n' +
    'You can get and create ballot papers for an election.',
  parameters: [electionIdParameter],
  post: {
    tags: [Tag.BallotPapers],
    summary: 'Create a ballot paper',
    description:
      'Creates a ballot paper with a link to an election.\n' +
      'The user of the API access token needs access to the linked election.\n' +
      'A ballot paper can only be created if the linked election is not frozen.',
    security: [{ [SecuritySchemaName.voturaBackendAuth]: [] }],
    operationId: 'createBallotPaper',
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: insertableBallotPaperObjectSchema as OpenAPIV3.SchemaObject,
        },
      },
    },
    responses: {
      201: {
        description:
          'Created. The request was successfully executed. Successfully created a new ballot paper.',
        content: {
          'application/json': {
            schema: selectableBallotPaperObjectSchema as OpenAPIV3.SchemaObject,
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
    tags: [Tag.BallotPapers],
    summary: 'Get all ballot papers for an election',
    description:
      'Returns all ballot papers with the public information fields, that are linked to the specified election. \n' +
      'The user of the API access token needs the access rights to the election to read the ballot papers.',
    security: [{ [SecuritySchemaName.voturaBackendAuth]: [] }],
    operationId: 'getBallotPapers',
    responses: {
      200: {
        description:
          'OK. The request was successfully executed. Returns ballot papers for the requested election.',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              minItems: 0,
              uniqueItems: true,
              items: selectableBallotPaperObjectSchema as OpenAPIV3.SchemaObject,
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
