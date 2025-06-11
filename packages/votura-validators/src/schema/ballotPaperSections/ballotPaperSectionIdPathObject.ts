import { OpenAPIV3 } from 'openapi-types';
import { ballotPaperSectionIdParameter } from './ballotPaperSectionIdParameter.js';
import { Tag } from '../globals/tag.js';
import { SecuritySchemaName } from '../globals/securitySchemaName.js';
import {
  selectableBallotPaperSectionObjectSchema,
  updateableBallotPaperSectionObjectSchema,
} from '../../objects/ballotPaperSection.js';
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
import { electionIdParameter } from '../elections/electionIdParameter.js';
import { ballotPaperIdParameter } from '../ballotPapers/ballotPaperIdParameter.js';

export const ballotPaperSectionIdPathObject: OpenAPIV3.PathItemObject = {
  summary: 'Manage a specific ballot paper section',
  description: 'Read, update or delete a specific ballot paper section.',
  parameters: [electionIdParameter, ballotPaperIdParameter, ballotPaperSectionIdParameter],
  put: {
    tags: [Tag.BallotPaperSections],
    summary: 'Update a specific ballot paper section',
    description:
      'Updates the configuration of the requested ballot paper section with the provided information.\n' +
      'The user of the API access token needs access to the linked ballot paper / election.\n' +
      'A ballot paper section can only be updated if the linked election is not frozen.\n' +
      '\n' +
      'This endpoint is currently only a draft and not implemented!\n' +
      'When this endpoint is implemented this note will be removed.',
    security: [{ [SecuritySchemaName.voturaBackendAuth]: [] }],
    operationId: 'updateBallotPaperSectionById',
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: updateableBallotPaperSectionObjectSchema as OpenAPIV3.SchemaObject,
        },
      },
    },
    responses: {
      200: {
        description:
          'OK. The request was successfully executed. The ballot paper section was updated.',
        content: {
          'application/json': {
            schema: selectableBallotPaperSectionObjectSchema as OpenAPIV3.SchemaObject,
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
    tags: [Tag.BallotPaperSections],
    summary: 'Get a specific ballot paper section',
    description:
      'Returns the requested ballot paper section with all public information fields.\n' +
      'The user of the API access token needs access to the linked ballot paper / election.\n' +
      '\n' +
      'This endpoint is currently only a draft and not implemented!\n' +
      'When this endpoint is implemented this note will be removed.',
    security: [{ [SecuritySchemaName.voturaBackendAuth]: [] }],
    operationId: 'getBallotPaperSectionById',
    responses: {
      200: {
        description:
          'OK. The request was successfully executed. Returns the requested ballot paper section with all public information fields.',
        content: {
          'application/json': {
            schema: selectableBallotPaperSectionObjectSchema as OpenAPIV3.SchemaObject,
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
    tags: [Tag.BallotPaperSections],
    summary: 'Delete a specific ballot paper section',
    description:
      'Deletes the requested ballot paper section.\n' +
      'The user of the API access token needs access to the linked ballot paper / election.\n' +
      'A ballot paper section can only be deleted if the linked election is not frozen.\n' +
      '\n' +
      'This endpoint is currently only a draft and not implemented!\n' +
      'When this endpoint is implemented this note will be removed.',
    security: [{ [SecuritySchemaName.voturaBackendAuth]: [] }],
    operationId: 'deleteBallotPaperSectionById',
    responses: {
      204: {
        description:
          'No Content. The request was successfully executed. The ballot paper section was deleted.',
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
