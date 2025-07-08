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
      'Creates and returns voter tokens for every voter in the requested voter group.\n' +
      'The user of the API access token needs access to the voter group and all linked ballot papers & elections.\n' +
      'The voter tokens for a voter group can only be created if all linked ballot papers & elections are frozen.\n' +
      'The voter tokens can only be created once after freezing.\n' +
      '\n' +
      'This endpoint is currently only a draft and not implemented!\n' +
      'When this endpoint is implemented this note will be removed.',
    security: [{ [SecuritySchemaName.voturaBackendAuth]: [] }],
    operationId: 'getVoterTokensForId',
    responses: {
      200: {
        description:
          'OK. The request was successfully executed. Returns the requested voter tokens for the requested voter group.',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              minItems: 1,
              uniqueItems: true,
              items: {
                description:
                  'The voter token for a voter.\n' +
                  'This token is used to authenticate the voter for the ballot papers.',
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
