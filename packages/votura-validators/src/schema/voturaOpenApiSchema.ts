import type { OpenAPIV3 } from 'openapi-types';
import { ballotPaperIdPathObject } from './ballotPapers/ballotPaperIdPathObject.js';
import { ballotPapersPathObject } from './ballotPapers/ballotPapersPathObject.js';
import { ballotPaperSectionIdPathObject } from './ballotPaperSections/ballotPaperSectionIdPathObject.js';
import { ballotPaperSectionsPathObject } from './ballotPaperSections/ballotPaperSectionsPathObject.js';
import { candidatePathObject } from './ballotPaperSections/candidatePathObject.js';
import { candidateIdPathObject } from './candidates/candidateIdPathObject.js';
import { candidatesPathObject } from './candidates/candidatesPathObject.js';
import { electionIdPathObject } from './elections/electionIdPathObject.js';
import { electionsPathObject } from './elections/electionsPathObject.js';
import { freezePathObject } from './elections/freezePathObject.js';
import { unfreezePathObject } from './elections/unfreezePathObject.js';
import { parameter } from './globals/parameter.js';
import { SecuritySchemaName } from './globals/securitySchemaName.js';
import { Tag } from './globals/tag.js';
import { heartbeatPathObject } from './heartbeatPathObject.js';
import { loginPathObject } from './users/loginPathObject.js';
import { logoutPathObject } from './users/logoutPathObject.js';
import { refreshTokensPathObject } from './users/refreshTokensPathObject.js';
import { requestPasswordResetPathObject } from './users/requestPasswordResetPathObject.js';
import { resetPasswordPathObject } from './users/resetPasswordPathObject.js';
import { usersPathObject } from './users/usersPathObject.js';
import { verifyEmailPathObject } from './users/verifyEmailPathObject.js';
import { createVoterTokensPathObject } from './voterGroups/createVoterTokensPathObject.js';
import { voterGroupIdPathObject } from './voterGroups/voterGroupIdPathObject.js';
import { voterGroupsPathObject } from './voterGroups/voterGroupsPathObject.js';
import { castVotePathObject } from './voting/castVotePathObject.js';
import { votingElectionsPathObject } from './voting/votingElectionsPathObject.js';

export const voturaOpenApiSchema: OpenAPIV3.Document = {
  openapi: '3.0.0',
  info: {
    title: 'Votura-API',
    description:
      'This is the OpenAPI specification for the communication to the votura backend via the REST-API. The votura frontend and backend communicate via this API.\n\n' +
      'If a request body object contains more than the required properties, the additional properties will be ignored without throwing an error.',
    termsOfService: 'https://github.com/SE-UUlm/votura?tab=coc-ov-file',
    contact: {
      name: 'Votura Dev-Team',
      url: 'https://github.com/SE-UUlm/votura/discussions/categories/q-a',
    },
    license: {
      name: 'MIT',
      url: 'https://github.com/SE-UUlm/votura?tab=MIT-1-ov-file',
    },
    version: '0.0.0',
  },
  externalDocs: {
    url: 'https://se-uulm.github.io/votura/',
    description: 'The votura documentation',
  },
  servers: [
    {
      url: 'http://127.0.0.1:{port}',
      description: 'The default local development server.',
      variables: {
        port: {
          default: '4000',
          description: 'The port of the local development server, the votura backend.',
        },
      },
    },
    {
      url: 'https://votura.informatik.uni-ulm.de/api/v1',
      description: 'The live bwCloud testing votura backend server',
    },
  ],
  components: {
    securitySchemes: {
      [SecuritySchemaName.voturaBackendAuth]: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description:
          'With this JWT access token the user can authenticate and authorize himself against the votura backend to modify elections.',
      },
      [SecuritySchemaName.voturaVoterAuth]: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description:
          'With this JWT token the voter can authenticate and authorize himself against the votura backend to take part in the voting process.',
      },
    },
  },
  tags: [
    {
      name: Tag.elections,
      description: 'Managing CRUD operations for elections.',
    },
    {
      name: Tag.users,
      description: 'Managing CRUD operations for users and sessions.',
    },
    {
      name: Tag.ballotPapers,
      description: 'Managing CRUD operations for ballot papers.',
    },
    {
      name: Tag.ballotPaperSections,
      description: 'Managing CRUD operations for ballot paper sections.',
    },
    {
      name: Tag.candidates,
      description: 'Managing CRUD operations for candidates.',
    },
    {
      name: Tag.voterGroups,
      description: 'Managing CRUD operations for voter groups.',
    },
    {
      name: Tag.voting,
      description: 'Managing API endpoints for the voting process.',
    },
    {
      name: Tag.miscellaneous,
      description: 'Contains various additional resources.',
    },
  ],
  paths: {
    [`/elections`]: electionsPathObject,
    [`/elections/{${parameter.electionId}}`]: electionIdPathObject,
    [`/elections/{${parameter.electionId}}/freeze`]: freezePathObject,
    [`/elections/{${parameter.electionId}}/unfreeze`]: unfreezePathObject,
    [`/elections/{${parameter.electionId}}/ballotPapers`]: ballotPapersPathObject,
    [`/elections/{${parameter.electionId}}/ballotPapers/{${parameter.ballotPaperId}}`]:
      ballotPaperIdPathObject,
    [`/elections/{${parameter.electionId}}/ballotPapers/{${parameter.ballotPaperId}}/ballotPaperSections`]:
      ballotPaperSectionsPathObject,
    [`/elections/{${parameter.electionId}}/ballotPapers/{${parameter.ballotPaperId}}/ballotPaperSections/{${parameter.ballotPaperSectionId}}`]:
      ballotPaperSectionIdPathObject,
    [`/elections/{${parameter.electionId}}/ballotPapers/{${parameter.ballotPaperId}}/ballotPaperSections/{${parameter.ballotPaperSectionId}}/candidates`]:
      candidatePathObject,
    [`/elections/{${parameter.electionId}}/candidates`]: candidatesPathObject,
    [`/elections/{${parameter.electionId}}/candidates/{${parameter.candidateId}}`]:
      candidateIdPathObject,
    [`/users`]: usersPathObject,
    [`/users/verifyEmail`]: verifyEmailPathObject,
    [`/users/login`]: loginPathObject,
    [`/users/refreshTokens`]: refreshTokensPathObject,
    [`/users/requestPasswordReset`]: requestPasswordResetPathObject,
    [`/users/resetPassword`]: resetPasswordPathObject,
    [`/users/logout`]: logoutPathObject,
    [`/voterGroups`]: voterGroupsPathObject,
    [`/voterGroups/{${parameter.voterGroupId}}`]: voterGroupIdPathObject,
    [`/voterGroups/{${parameter.voterGroupId}}/createVoterTokens`]: createVoterTokensPathObject,
    [`/voting/getElections`]: votingElectionsPathObject,
    [`/voting/castVote`]: castVotePathObject,
    [`/heartbeat`]: heartbeatPathObject,
  },
};
