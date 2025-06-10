import { OpenAPIV3 } from 'openapi-types';
import { Tag } from '../globals/tag.js';
import { SecuritySchemaName } from '../globals/securitySchemaName.js';
import { ballotPaperIdParameter } from './ballotPaperIdParameter.js';
import { SelectableBallotPaperSectionObjectSchema } from '../../objects/ballotPaperSection.js';
import {
  response400,
  response401,
  response403,
  response404,
  response406,
  response429,
  responseDefault,
} from '../globals/responses.js';

export const ballotPaperSectionsBallotPapersPathObject: OpenAPIV3.PathItemObject = {
  summary: 'Get ballot paper sections',
  description:
    'A ballot paper section is always linked to one ballot paper.\n' +
    'You can get ballot paper sections for a ballot paper.',
  parameters: [ballotPaperIdParameter],
  get: {
    tags: [Tag.BallotPaperSections],
    summary: 'Get all ballot paper section for a ballot paper',
    description:
      'Returns all ballot paper sections with the public information fields, that are linked to the specified ballot paper. \n' +
      'The user of the API access token needs the access rights to the ballot paper / election to read the ballot paper section.\n' +
      '\n' +
      'This endpoint is currently only a draft and not implemented!\n' +
      'When this endpoint is implemented this note will be removed.',
    security: [{ [SecuritySchemaName.voturaBackendAuth]: [] }],
    operationId: 'getBallotPapersSections',
    responses: {
      200: {
        description:
          'OK. The request was successfully executed. Returns ballot paper sections for the requested election.',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              minItems: 0,
              uniqueItems: true,
              items: SelectableBallotPaperSectionObjectSchema as OpenAPIV3.SchemaObject,
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
