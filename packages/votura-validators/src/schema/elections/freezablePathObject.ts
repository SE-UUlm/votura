import type { OpenAPIV3 } from 'openapi-types';
import { freezableElectionObjectSchema } from '../../objects/election.js';
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

export const freezablePathObject: OpenAPIV3.PathItemObject = {
  get: {
    tags: [Tag.elections],
    summary: 'Returns if a specific election may be frozen',
    description:
      'Returns if a specific election may be frozen.\n' +
      'This is true if the election is not jet frozen and is in a valid state.\n' +
      'A valid state is:\n' +
      '- The election must have at least one ballot paper.\n' +
      '- Each ballot paper must have at least one section.\n' +
      '- Each ballot paper section must have at least one candidate linked to it.\n' +
      '- All candidates linked to the election must be linked to at least one ballot paper section.',
    security: [{ [SecuritySchemaName.voturaBackendAuth]: [] }],
    operationId: 'getFreezableElectionById',
    responses: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      200: {
        description:
          'OK. The request was successfully executed. Returns a boolean indicating if the election is freezable. True = Election can be frozen.',
        content: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          'application/json': {
            schema: freezableElectionObjectSchema as OpenAPIV3.SchemaObject,
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
