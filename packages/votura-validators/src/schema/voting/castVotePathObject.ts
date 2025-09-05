import type { OpenAPIV3 } from 'openapi-types';
import { filledBallotPaperObjectSchema } from '../../objects/filledBallotPaper.js';
import {
  response400,
  response401,
  response406,
  response429,
  responseDefault,
} from '../globals/responses.js';
import { SecuritySchemaName } from '../globals/securitySchemaName.js';
import { Tag } from '../globals/tag.js';

export const castVotePathObject: OpenAPIV3.PathItemObject = {
  summary: 'Send a filled in ballot paper to the backend to cast a vote',
  description:
    'Accepts the ballot paper the voter wants to submit to the backend as json object with encrypted contents. With this, the vote of voter is cast.',
  post: {
    tags: [Tag.voting],
    summary: 'Send a filled in ballot paper to the backend to cast a vote',
    description:
      'Accepts the ballot paper the voter wants to submit to the backend as json object with encrypted contents. ' +
      'With this, the vote of voter is cast.\n' +
      'The json object is described in the developer guide of the wiki in "Cryptographic Workflow". ' +
      'In case the vote is invalid and invalid votes are not supported, the error code 400 is returned.' +
      '\n\n' +
      'This endpoint is currently only a draft and not implemented!\n' +
      'When this endpoint is implemented this note will be removed.',
    security: [{ [SecuritySchemaName.voturaVoterAuth]: [] }],
    operationId: 'castVote',
    requestBody: {
      content: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'application/json': {
          schema: filledBallotPaperObjectSchema as OpenAPIV3.SchemaObject,
        },
      },
    },
    responses: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      204: {
        description:
          'No content. The request was successfully executed and the vote / ballot paper was accepted.',
      },
      ...response400,
      ...response401,
      ...response406,
      ...response429,
      ...responseDefault,
    },
  },
};
