import type { OpenAPIV3 } from 'openapi-types';
import {
  selectableBallotPaperSectionObjectSchema,
  updateableBallotPaperSectionCandidateObjectSchema,
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
    tags: [Tag.ballotPaperSections],
    summary: 'Add or remove a candidate to / from a ballot paper section',
    description:
      'Adds or removes an existing candidate to / from the specified ballot paper section. ' +
      'The user of the API access token needs access to the linked ballot paper / election. ' +
      'A candidate can only be added or removed if the linked election is not frozen. ' +
      'The candidate can not be added multiple times to the same ballot paper section.' +
      'A candidate can only be removed if it was previously added to the ballot paper section.',
    security: [{ [SecuritySchemaName.voturaBackendAuth]: [] }],
    operationId: 'updateCandidateInBallotPaperSection',
    requestBody: {
      required: true,
      content: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'application/json': {
          schema: updateableBallotPaperSectionCandidateObjectSchema as OpenAPIV3.SchemaObject,
        },
      },
    },
    responses: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      200: {
        description:
          'OK. The request was successfully executed. ' +
          'The candidate is now added to / removed from the ballot paper section.',
        content: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
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
