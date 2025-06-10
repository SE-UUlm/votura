import { OpenAPIV3 } from 'openapi-types';
import { ballotPaperIdParameter } from './ballotPaperIdParameter.js';
import { Tag } from '../globals/tag.js';
import { SecuritySchemaName } from '../globals/securitySchemaName.js';
import {
  SelectableBallotPaperObjectSchema,
  UpdateableBallotPaperObjectSchema,
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

export const ballotPaperIdPathObject: OpenAPIV3.PathItemObject = {
  summary: 'Manage a specific ballot paper',
  description: 'Read, update or delete a specific election.',
  parameters: [ballotPaperIdParameter],
  put: {
    tags: [Tag.BallotPapers],
    summary: 'Update a specific ballot paper',
    description:
      'Updates the configuration of the requested ballot paper with the provided information.\n' +
      'The user of the API access token needs access to the linked election.\n' +
      'A ballot paper can only be updated if the linked election is not frozen.\n' +
      '\n' +
      'This endpoint is currently only a draft and not implemented!\n' +
      'When this endpoint is implemented this note will be removed.',
    security: [{ [SecuritySchemaName.voturaBackendAuth]: [] }],
    operationId: 'updateBallotPaperById',
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: UpdateableBallotPaperObjectSchema as OpenAPIV3.SchemaObject,
        },
      },
    },
    responses: {
      200: {
        description: 'OK. The request was successfully executed. The ballot paper was updated.',
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
  get: {
    tags: [Tag.BallotPapers],
    summary: 'Get a specific ballot paper',
    description:
      'Returns the requested ballot paper with all public information fields.\n' +
      'The user of the API access token needs access to the linked election.\n' +
      '\n' +
      'This endpoint is currently only a draft and not implemented!\n' +
      'When this endpoint is implemented this note will be removed.',
    security: [{ [SecuritySchemaName.voturaBackendAuth]: [] }],
    operationId: 'getBallotPaperById',
    responses: {
      200: {
        description:
          'OK. The request was successfully executed. Returns the requested ballot paper with all public information fields.',
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
      ...response429,
      ...responseDefault,
    },
  },
  delete: {
    tags: [Tag.BallotPapers],
    summary: 'Delete a specific ballot paper',
    description:
      'Deletes the requested ballot paper.\n' +
      'The user of the API access token needs access to the linked election.\n' +
      'A ballot paper can only be deleted if the linked election is not frozen.\n' +
      '\n' +
      'This endpoint is currently only a draft and not implemented!\n' +
      'When this endpoint is implemented this note will be removed.',
    security: [{ [SecuritySchemaName.voturaBackendAuth]: [] }],
    operationId: 'deleteBallotPaperById',
    responses: {
      204: {
        description:
          'No Content. The request was successfully executed. The ballot paper was deleted.',
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
