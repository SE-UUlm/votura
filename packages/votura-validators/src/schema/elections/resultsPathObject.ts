import type { OpenAPIV3 } from 'openapi-types';
import { selectableElectionResultObjectSchema } from '../../objects/electionResult.js';
import { uuidObjectSchema } from '../../objects/identifiableObject.js';
import { parameter } from '../globals/parameter.js';
import {
  response400,
  response404,
  response406,
  response429,
  responseDefault,
} from '../globals/responses.js';
import { Tag } from '../globals/tag.js';

export const resultsPathObject: OpenAPIV3.PathItemObject = {
  summary: 'Get the published results of a specific election',
  description: 'Returns the published results of the requested election.',
  parameters: [
    {
      name: parameter.electionId,
      in: 'path',
      description:
        'The unique identifier for the election. ' +
        'The id must be a valid UUIDv4. ' +
        'The results of the requested election must be published.',
      required: true,
      schema: uuidObjectSchema as OpenAPIV3.SchemaObject,
    },
  ],
  get: {
    tags: [Tag.elections],
    summary: 'Get the published results of a specific election',
    description:
      'Returns the published results of the requested election. ' +
      'This endpoint is public, so everyone can retrieve and verify the results.',
    security: [],
    operationId: 'getElectionResultsById',
    responses: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      200: {
        description:
          'OK. The request was successfully executed. Returns the published results of the requested election.',
        content: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          'application/json': {
            schema: selectableElectionResultObjectSchema as OpenAPIV3.SchemaObject,
          },
        },
      },
      ...response400,
      ...response404,
      ...response406,
      ...response429,
      ...responseDefault,
    },
  },
};
