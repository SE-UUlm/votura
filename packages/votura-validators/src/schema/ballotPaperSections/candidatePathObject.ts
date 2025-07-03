import type { OpenAPIV3 } from 'openapi-types';
import {
  insertableBallotPaperSectionCandidateObjectSchema,
  removableBallotPaperSectionCandidateObjectSchema,
  selectableBallotPaperSectionObjectSchema,
} from '../../objects/ballotPaperSection.js';
import { ballotPaperIdParameter } from '../ballotPapers/ballotPaperIdParameter.js';
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
import { ballotPaperSectionIdParameter } from './ballotPaperSectionIdParameter.js';

export const candidatePathObject: OpenAPIV3.PathItemObject = {
  summary: 'Add or remove candidates from a ballot paper section',
  description:
    'Adds a new candidate or removes an existing candidate from the specified ballot paper section.',
  parameters: [electionIdParameter, ballotPaperIdParameter, ballotPaperSectionIdParameter],
  put: {
    tags: [Tag.BallotPaperSections],
    summary: 'Add a candidate to a ballot paper section',
    description:
      'Adds an existing candidate to the specified ballot paper section. ' +
      'The user of the API access token needs access to the linked ballot paper / election. ' +
      'A candidate can only be added if the linked election is not frozen.\n' +
      '\n' +
      'This endpoint is currently only a draft and not implemented!\n' +
      'When this endpoint is implemented this note will be removed.',
    security: [{ [SecuritySchemaName.voturaBackendAuth]: [] }],
    operationId: 'addCandidateToBallotPaperSection',
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: insertableBallotPaperSectionCandidateObjectSchema as OpenAPIV3.SchemaObject,
        },
      },
    },
    responses: {
      200: {
        description:
          'OK. The request was successfully executed. ' +
          'The candidate is now added to the ballot paper section.',
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
  delete: {
    tags: [Tag.BallotPaperSections],
    summary: 'Remove a candidate from a ballot paper section',
    description:
      'Removes an existing candidate from the specified ballot paper section.\n' +
      'The user of the API access token needs access to the linked ballot paper / election. ' +
      'A candidate can only be removed from the ballot paper section if the linked election is not frozen.\n' +
      '\n' +
      'This endpoint is currently only a draft and not implemented!\n' +
      'When this endpoint is implemented this note will be removed.',
    security: [{ [SecuritySchemaName.voturaBackendAuth]: [] }],
    operationId: 'removeCandidateFromBallotPaperSection',
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: removableBallotPaperSectionCandidateObjectSchema as OpenAPIV3.SchemaObject,
        },
      },
    },
    responses: {
      200: {
        description:
          'OK. The request was successfully executed. ' +
          'The candidate was removed from the ballot paper section.',
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
};
