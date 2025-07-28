import type { OpenAPIV3 } from 'openapi-types';
import {
  insertableCandidateObjectSchema,
  selectableCandidateObjectSchema,
} from '../../objects/candidate.js';
import { electionIdParameter } from '../elections/electionIdParameter.js';
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
import { candidateIdParameter } from './candidateIdParameter.js';

export const candidateIdPathObject: OpenAPIV3.PathItemObject = {
  summary: 'Manage a specific candidate',
  description: 'Read, update or delete a specific candidate.',
  parameters: [electionIdParameter, candidateIdParameter],
  put: {
    tags: [Tag.candidates],
    summary: 'Update a specific candidate',
    description:
      'Updates the configuration of the requested candidate with the provided information.\n' +
      'The user of the API access token needs access to the linked election.\n' +
      'The candidate can only be updated if the linked election is not frozen.',
    security: [{ [SecuritySchemaName.voturaBackendAuth]: [] }],
    operationId: 'updateCandidateById',
    requestBody: {
      required: true,
      content: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'application/json': {
          schema: insertableCandidateObjectSchema as OpenAPIV3.SchemaObject,
        },
      },
    },
    responses: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      200: {
        description: 'OK. The request was successfully executed. The candidate was updated.',
        content: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          'application/json': {
            schema: selectableCandidateObjectSchema as OpenAPIV3.SchemaObject,
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
  get: {
    tags: [Tag.candidates],
    summary: 'Get a specific candidate',
    description:
      'Returns the requested candidate with all public information fields.\n' +
      'The user of the API access token needs access to the linked election.',
    security: [{ [SecuritySchemaName.voturaBackendAuth]: [] }],
    operationId: 'getCandidateById',
    responses: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      200: {
        description:
          'OK. The request was successfully executed. Returns the requested candidate with all public information fields.',
        content: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          'application/json': {
            schema: selectableCandidateObjectSchema as OpenAPIV3.SchemaObject,
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
  delete: {
    tags: [Tag.candidates],
    summary: 'Delete a specific candidate',
    description:
      'Deletes the requested candidate.\n' +
      'The user of the API access token needs access to the linked election.\n' +
      'The candidate can only be deleted if the linked election is not frozen.',
    security: [{ [SecuritySchemaName.voturaBackendAuth]: [] }],
    operationId: 'deleteCandidateById',
    responses: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      204: {
        description:
          'No Content. The request was successfully executed. The candidate was deleted.',
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
