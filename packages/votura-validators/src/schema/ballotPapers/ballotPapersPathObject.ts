import { OpenAPIV3 } from 'openapi-types';
import { Tag } from '../globals/tag.js';
import { SecuritySchemaName } from '../globals/securitySchemaName.js';
import {
  InsertableBallotPaperObjectSchema,
  SelectableBallotPaperObjectSchema,
} from '../../objects/ballotPaper.js';
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

export const ballotPapersPathObject: OpenAPIV3.PathItemObject = {
  summary: 'Create ballot papers',
  description:
    'A ballot paper is always linked to one election.\n' +
    'You can create a new one for an election.',
  post: {
    tags: [Tag.BallotPapers],
    summary: 'Create a ballot paper',
    description:
      'Creates a ballot paper with a link to an election.\n' +
      'The user of the API access token needs access to the linked election.\n' +
      'A ballot paper can only be created if the linked election is not frozen.\n' +
      '\n' +
      'This endpoint is currently only a draft and not implemented!\n' +
      'When this endpoint is implemented this note will be removed.',
    security: [{ [SecuritySchemaName.voturaBackendAuth]: [] }],
    operationId: 'createBallotPaper',
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: InsertableBallotPaperObjectSchema as OpenAPIV3.SchemaObject,
        },
      },
    },
    responses: {
      201: {
        description:
          'Created. The request was successfully executed. Successfully created a new ballot paper.',
        content: {
          'application/json': {
            schema: SelectableBallotPaperObjectSchema as OpenAPIV3.SchemaObject,
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
};
