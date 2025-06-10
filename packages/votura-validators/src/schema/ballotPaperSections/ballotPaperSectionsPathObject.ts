import { OpenAPIV3 } from 'openapi-types';
import { Tag } from '../globals/tag.js';
import { SecuritySchemaName } from '../globals/securitySchemaName.js';
import {
  InsertableBallotPaperSectionObjectSchema,
  SelectableBallotPaperSectionObjectSchema,
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

export const ballotPaperSectionsPathObject: OpenAPIV3.PathItemObject = {
  summary: 'Create ballot paper sections',
  description:
    'A ballot paper section is always linked to one ballot paper.\n' +
    'You can create a new one for a ballot paper.',
  post: {
    tags: [Tag.BallotPaperSections],
    summary: 'Create a ballot paper section',
    description:
      'Creates a ballot paper section with a link to a ballot paper.\n' +
      'The user of the API access token needs access to the linked ballot paper (election).\n' +
      'A ballot paper can only be created if the election of the linked ballot paper is not frozen.\n' +
      '\n' +
      'This endpoint is currently only a draft and not implemented!\n' +
      'When this endpoint is implemented this note will be removed.',
    security: [{ [SecuritySchemaName.voturaBackendAuth]: [] }],
    operationId: 'createBallotPaperSection',
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: InsertableBallotPaperSectionObjectSchema as OpenAPIV3.SchemaObject,
        },
      },
    },
    responses: {
      201: {
        description:
          'Created. The request was successfully executed. Successfully created a new ballot paper section.',
        content: {
          'application/json': {
            schema: SelectableBallotPaperSectionObjectSchema as OpenAPIV3.SchemaObject,
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
