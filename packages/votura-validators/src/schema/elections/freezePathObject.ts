import type { OpenAPIV3 } from 'openapi-types';
import { selectableElectionObjectSchema } from '../../objects/election.js';
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
import { SecuritySchemaName } from '../globals/securitySchemaName.js';
import { Tag } from '../globals/tag.js';
import { electionIdParameter } from './electionIdParameter.js';

export const freezePathObject: OpenAPIV3.PathItemObject = {
  summary: 'Freeze a specific election',
  description: 'Freezes the requested election.',
  parameters: [electionIdParameter],
  put: {
    tags: [Tag.elections],
    summary: 'Freeze a specific election',
    description:
      'Freezes the requested election.\n' +
      'Note that freezing an election is an action that should be done with caution and after a careful review of the election configuration.\n' +
      'After an election is frozen, the configuration of the election can not be changed anymore.\n' +
      'You can not change the number of allowed voters.\n' +
      '\n' +
      'After the election is frozen, the key pair for the election will be generated.\n' +
      'The access tokens for your voters can be generated after that.\n' +
      'Note that it will take some time until the generated keys are available.\n' +
      'After that, you can distribute the generated voting tokens to your voters.',
    security: [{ [SecuritySchemaName.voturaBackendAuth]: [] }],
    operationId: 'freezeElectionById',
    responses: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      200: {
        description:
          'OK.\n' + 'The request was successfully executed.\n' + 'The election is now frozen.',
        content: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          'application/json': {
            schema: selectableElectionObjectSchema as OpenAPIV3.SchemaObject,
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
