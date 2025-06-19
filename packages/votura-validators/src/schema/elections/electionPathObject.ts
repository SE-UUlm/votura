import { OpenAPIV3 } from 'openapi-types';
import {
  selectableElectionObjectSchema,
  updateableElectionObjectSchema,
} from '../../objects/election.js';
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

export const electionPathObject: OpenAPIV3.PathItemObject = {
  summary: 'Manage a specific election',
  description: 'Read, update or delete a specific election.',
  parameters: [electionIdParameter],
  put: {
    tags: [Tag.Elections],
    summary: 'Update a specific election',
    description:
      'Updates the configuration of the requested election with the provided information. The election can only be updated if the election is not frozen.',
    security: [{ [SecuritySchemaName.voturaBackendAuth]: [] }],
    operationId: 'updateElectionById',
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: updateableElectionObjectSchema as OpenAPIV3.SchemaObject,
        },
      },
    },
    responses: {
      200: {
        description: 'OK. The request was successfully executed. The election was updated.',
        content: {
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
  get: {
    tags: [Tag.Elections],
    summary: 'Get a specific election',
    description: 'Returns the requested election with all public information fields.',
    security: [{ [SecuritySchemaName.voturaBackendAuth]: [] }],
    operationId: 'getElectionById',
    responses: {
      200: {
        description:
          'OK. The request was successfully executed. Returns the requested election with all public information fields.',
        content: {
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
      ...response429,
      ...responseDefault,
    },
  },
  delete: {
    tags: [Tag.Elections],
    summary: 'Delete a specific election',
    description:
      'Deletes the requested election. The election will be deleted from the database. Note that also all linked data (like votes) will be removed.',
    security: [{ [SecuritySchemaName.voturaBackendAuth]: [] }],
    operationId: 'deleteElectionById',
    responses: {
      204: {
        description: 'No Content. The request was successfully executed. The election was deleted.',
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
