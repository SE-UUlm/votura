import { OpenAPIV3 } from 'openapi-types';
import { Tag } from '../globals/tag.js';
import { SecuritySchemaName } from '../globals/securitySchemaName.js';
import { SelectableBallotPaperObjectSchema } from '../../objects/ballotPaper.js';
import {
  response400,
  response401,
  response403,
  response404,
  response406,
  response429,
  responseDefault,
} from '../globals/responses.js';
import { electionIdParameter } from './electionIdParameter.js';

export const ballotPapersElectionsPathObject: OpenAPIV3.PathItemObject = {
  get: {
    tags: [Tag.Elections, Tag.BallotPapers],
    summary: 'Get all ballot papers for an election',
    description:
      'Returns all ballot papers with the public information fields, that are linked to the specified election. \n' +
      'The user of the API access token needs the access rights to the election to read the ballot papers.\n' +
      '\n' +
      'This endpoint is currently only a draft and not implemented!\n' +
      'When this endpoint is implemented this note will be removed.',
    security: [{ [SecuritySchemaName.voturaBackendAuth]: [] }],
    operationId: 'getBallotPapers',
    parameters: [electionIdParameter],
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
              items: SelectableBallotPaperObjectSchema as OpenAPIV3.SchemaObject,
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
