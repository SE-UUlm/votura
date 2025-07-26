import type { OpenAPIV3 } from 'openapi-types';
import { response429, responseDefault } from './globals/responses.js';
import { Tag } from './globals/tag.js';

export const heartbeatPathObject: OpenAPIV3.PathItemObject = {
  summary: 'Check if application is responding',
  get: {
    summary: 'Check if the application is ready to respond',
    description: 'This heartbeat check can be used for waiting on the application to be responsive',
    tags: [Tag.miscellaneous],
    operationId: 'getHeartBeat',
    responses: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      204: {
        description:
          'No Content. The request was successfully executed. The application is responding.',
      },
      ...response429,
      ...responseDefault,
    },
  },
};
