import type { OpenAPIV3 } from 'openapi-types';
import { selectableElectionResultObjectSchema } from '../../objects/electionResult.js';
import {
  response400,
  response401,
  response403,
  response404,
  response406,
  response409,
  response415,
  response429,
  responseDefault,
} from '../globals/responses.js';
import { SecuritySchemaName } from '../globals/securitySchemaName.js';
import { Tag } from '../globals/tag.js';
import { electionIdParameter } from './electionIdParameter.js';

export const publishResultsPathObject: OpenAPIV3.PathItemObject = {
  summary: 'Publish the results of a specific election',
  description: 'Publishes the results of the requested election.',
  parameters: [electionIdParameter],
  put: {
    tags: [Tag.elections],
    summary: 'Publish the results of a specific election',
    description:
      'Tallies the votes of the requested election and publishes the results.\n' +
      'The results can only be published if:\n' +
      '- The election is frozen.\n' +
      '- The voting process of the election has ended.\n' +
      '- The results of the election are not published yet.\n\n' +
      'After the results are published, they can be retrieved by everyone without authentication.',
    security: [{ [SecuritySchemaName.voturaBackendAuth]: [] }],
    operationId: 'publishElectionResultsById',
    responses: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      200: {
        description:
          'OK.\n' +
          'The request was successfully executed.\n' +
          'The results of the election are now published.',
        content: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          'application/json': {
            schema: selectableElectionResultObjectSchema as OpenAPIV3.SchemaObject,
          },
        },
      },
      ...response400,
      ...response401,
      ...response403,
      ...response404,
      ...response406,
      ...response409,
      ...response415,
      ...response429,
      ...responseDefault,
    },
  },
};
