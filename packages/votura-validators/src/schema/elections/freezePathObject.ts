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
      'Freezes the requested election if it is in a valid state.\n' +
      'A valid state is:\n' +
      '- The election must have at least one ballot paper.\n' +
      '- Each ballot paper must have at least one section.\n' +
      '- Each ballot paper section must have at least one candidate linked to it.\n' +
      '- All candidates linked to the election must be linked to at least one ballot paper section.\n' +
      'Note that freezing an election is an action that should be done with caution and after a careful review of the election configuration.\n' +
      'After an election is frozen, the configuration of the election can not be changed anymore.\n' +
      'You can not change the number of allowed voters.\n' +
      '\n' +
      'After the election is frozen, the key pair for the election will be generated.\n' +
      'The access tokens for your voters can be generated after that.\n' +
      'Note that depending on the load of the system it will take some time until the generated keys are available.\n' +
      'You will get a response quickly without the keys, but the keys will be generated in the background.\n' +
      'If the keys are available, you will get them in your normal GET request for the election.',
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
