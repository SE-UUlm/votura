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

export const unfreezePathObject: OpenAPIV3.PathItemObject = {
  summary: 'Unfreeze a specific election',
  description: 'Unfreezes the requested election.',
  parameters: [electionIdParameter],
  put: {
    tags: [Tag.elections],
    summary: 'Unfreeze a specific election',
    description:
      'Unfreezes the requested election.\n' +
      'Note that unfreezing an election is an irreversible and destructive action.\n' +
      '\n' +
      'After an election is unfrozen, the configuration of the election can be changed again.\n' +
      'But all generated voting tokens will be revoked, and the election key pair will be revoked.\n' +
      'Also, every vote that was cast will be deleted.\n' +
      '\n' +
      'You are not allowed to unfreeze an election that is currently generating its election keys.',
    security: [{ [SecuritySchemaName.voturaBackendAuth]: [] }],
    operationId: 'unfreezeElectionById',
    responses: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      200: {
        description:
          'OK.\n' + 'The request was successfully executed.\n' + 'The election was unfrozen.',
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
