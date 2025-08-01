import type { OpenAPIV3 } from 'openapi-types';
import {
  response400,
  response401,
  response403,
  response404,
  response406,
  response429,
  responseDefault,
} from '../globals/responses.js';
import { SecuritySchemaName } from '../globals/securitySchemaName.js';
import { Tag } from '../globals/tag.js';
import { voterGroupIdParameter } from './voterGroupIdParameter.js';

export const createVoterTokensPathObject: OpenAPIV3.PathItemObject = {
  summary: 'Create voter tokens',
  description: 'Create new voter tokens for a specific voter group.',
  parameters: [voterGroupIdParameter],
  get: {
    tags: [Tag.voterGroups],
    summary: 'Create new voter tokens for a specific voter group',
    description:
      'Creates and returns new voter tokens for every voter in the requested voter group. ' +
      'The user of the API access token needs access to the voter group. ' +
      'The voter tokens for a voter group can only be created if all linked elections (ballot papers) are frozen. ' +
      'If you call this endpoint a second time, the existing voter tokens will be invalidated and new ones will be created. ' +
      'You never see generated tokens a second time.\n\n' +
      'If one linked election will be unfrozen, the voter tokens for all voter groups with a link to this election will be invalid.' +
      'The voting tokens can be created again after all linked elections of the voter group are frozen again.',
    security: [{ [SecuritySchemaName.voturaBackendAuth]: [] }],
    operationId: 'createVoterTokens',
    responses: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      200: {
        description:
          'OK. The request was successfully executed. Returns the requested voter tokens for the requested voter group.',
        content: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          'application/json': {
            schema: {
              type: 'array',
              minItems: 1,
              uniqueItems: true,
              items: {
                description:
                  'The JWT voting token for a voter.\n' +
                  'This token is used to authenticate the voter for the linked ballot papers. ' +
                  'The JWT payload contains the voter ID.',
                type: 'string',
                example:
                  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30',
                format: 'jwt',
                minLength: 1,
              },
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
