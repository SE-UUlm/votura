import type { OpenAPIV3 } from 'openapi-types';
import { userCountObjectSchema } from '../../objects/user.js';
import { response406, response429, responseDefault } from '../globals/responses.js';
import { Tag } from '../globals/tag.js';

export const userCountPathObject: OpenAPIV3.PathItemObject = {
  summary: 'Get total number of users',
  description: 'Returns the current total number of users in the database.',
  get: {
    tags: [Tag.users],
    summary: 'Get total number of users',
    description: 'Returns the current total number of users in the database.',
    security: [],
    operationId: 'getUserCount',
    responses: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      200: {
        description:
          'OK. The request was successfully executed. Returns the current total number of users.',
        content: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          'application/json': {
            schema: userCountObjectSchema as OpenAPIV3.SchemaObject,
          },
        },
      },
      ...response406,
      ...response429,
      ...responseDefault,
    },
  },
};
