import { OpenAPIV3 } from 'openapi-types';
import { electionIdParameter } from './electionIdParameter.js';
import { Tag } from '../globals/tag.js';
import { SecuritySchemaName } from '../globals/securitySchemaName.js';
import { SelectableElectionObjectSchema } from '../../objects/election.js';
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

export const unfreezeElectionPathObject: OpenAPIV3.PathItemObject = {
  summary: 'Unfreeze a specific election',
  description: 'Unfreezes the requested election.',
  parameters: [electionIdParameter],
  put: {
    tags: [Tag.Elections],
    summary: 'Unfreeze a specific election',
    description:
      'Unfreezes the requested election.\n' +
      'Note that unfreezing an election is an irreversible and destructive action.\n' +
      '\n' +
      'After an election is unfrozen, the configuration of the election can be changed again.\n' +
      'But all generated voting tokens will be revoked, and the election key pair will be revoked.\n' +
      'Also, every vote that was cast will be deleted.',
    security: [{ [SecuritySchemaName.voturaBackendAuth]: [] }],
    operationId: 'unfreezeElectionById',
    responses: {
      200: {
        description:
          'OK.\n' + 'The request was successfully executed.\n' + 'The election was unfrozen.',
        content: {
          'application/json': {
            schema: SelectableElectionObjectSchema as OpenAPIV3.SchemaObject,
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
