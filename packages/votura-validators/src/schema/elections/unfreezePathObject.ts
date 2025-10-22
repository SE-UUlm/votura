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
      'Unfreezes the selected election.\n' +
      'WARNING: This action cannot be undone and will delete important data.\n' +
      '\n' +
      'When you unfreeze an election, you can edit its settings again.\n' +
      'However, this will permanently delete:\n' +
      '- All voting tokens that were created for voter groups linked to this election\n' +
      '- The key pair for encrypting votes for this election\n' +
      '- All votes that were cast for this election (TODO)\n' +
      '- All votes in other elections that share the same voter groups (TODO)\n' +
      '\n' +
      'Example: If VoterGroup1 is used in both Election1 and Election2:\n' +
      '- Unfreezing Election1 will delete ALL votes in Election2 as well\n' +
      '- Exception: If Election1 is public, only votes from VoterGroup1 will be deleted in Election2\n' +
      '- Votes from other voter groups in Election2 will remain safe\n' +
      '\n' +
      'You cannot unfreeze an election while it is still creating its keys for encrypting votes.',
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
