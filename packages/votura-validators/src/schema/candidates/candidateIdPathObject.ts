import { OpenAPIV3 } from 'openapi-types';
import { electionIdParameter } from '../elections/electionIdParameter.js';
import { candidateIdParameter } from './candidateIdParameter.js';
import { Tag } from '../globals/tag.js';
import { SecuritySchemaName } from '../globals/securitySchemaName.js';
import {
  insertableCandidateObjectSchema,
  selectableCandidateObjectSchema,
} from '../../objects/candidate.js';
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

export const candidateIdPathObject: OpenAPIV3.PathItemObject = {
  summary: 'Manage a specific candidate',
  description: 'Read, update or delete a specific candidate.',
  parameters: [electionIdParameter, candidateIdParameter],
  put: {
    tags: [Tag.Candidates],
    summary: 'Update a specific candidate',
    description:
      'Updates the configuration of the requested candidate with the provided information.\n' +
      'The user of the API access token needs access to the linked election.\n' +
      'The candidate can only be updated if the linked election is not frozen.\n' +
      '\n' +
      'This endpoint is currently only a draft and not implemented!\n' +
      'When this endpoint is implemented this note will be removed.',
    security: [{ [SecuritySchemaName.voturaBackendAuth]: [] }],
    operationId: 'updateCandidateById',
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: insertableCandidateObjectSchema as OpenAPIV3.SchemaObject,
        },
      },
    },
    responses: {
      200: {
        description: 'OK. The request was successfully executed. The candidate was updated.',
        content: {
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
    tags: [Tag.Candidates],
    summary: 'Get a specific candidate',
    description:
      'Returns the requested candidate with all public information fields.\n' +
      'The user of the API access token needs access to the linked election.\n' +
      '\n' +
      'This endpoint is currently only a draft and not implemented!\n' +
      'When this endpoint is implemented this note will be removed.',
    security: [{ [SecuritySchemaName.voturaBackendAuth]: [] }],
    operationId: 'getCandidateById',
    responses: {
      200: {
        description:
          'OK. The request was successfully executed. Returns the requested candidate with all public information fields.',
        content: {
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
    tags: [Tag.Candidates],
    summary: 'Delete a specific candidate',
    description:
      'Deletes the requested candidate.\n' +
      'The user of the API access token needs access to the linked election.\n' +
      'The candidate can only be deleted if the linked election is not frozen.\n' +
      '\n' +
      'This endpoint is currently only a draft and not implemented!\n' +
      'When this endpoint is implemented this note will be removed.',
    security: [{ [SecuritySchemaName.voturaBackendAuth]: [] }],
    operationId: 'deleteCandidateById',
    responses: {
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
