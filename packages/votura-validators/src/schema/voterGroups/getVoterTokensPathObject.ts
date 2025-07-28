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

export const getVoterTokensPathObject: OpenAPIV3.PathItemObject = {
  summary: 'Create voter tokens for the voter group',
  description: 'Create voter tokens for a specific voter group.',
  parameters: [voterGroupIdParameter],
  get: {
    tags: [Tag.voterGroups],
    summary: 'Create voter tokens for a specific voter group',
    description:
      'Creates and returns voter tokens for every voter in the requested voter group. ' +
      'The user of the API access token needs access to the voter group. ' +
      'The voter tokens for a voter group can only be created if all linked elections (ballot papers) are frozen. ' +
      'The voter tokens can only be created once after freezing.\n\n' +
      'If one linked election will be unfrozen, the voter tokens for all voter groups with a link to this election will be invalid.' +
      'The voting tokens can be created again after all linked elections of the voter group are frozen again.',
    security: [{ [SecuritySchemaName.voturaBackendAuth]: [] }],
    operationId: 'getVoterTokensForId',
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
                // TODO: Update after implementation -> maybe dedicated zod schema
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
