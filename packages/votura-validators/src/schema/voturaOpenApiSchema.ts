import type { OpenAPIV3 } from 'openapi-types';
import { electionsPathObject } from './elections/electionsPathObject.js';
import { Tag } from './globals/tag.js';
import { SecuritySchemaName } from './globals/securitySchemaName.js';
import { electionIdPathObject } from './elections/electionIdPathObject.js';
import { freezePathObject } from './elections/freezePathObject.js';
import { unfreezePathObject } from './elections/unfreezePathObject.js';
import { usersPathObject } from './users/usersPathObject.js';
import { verifyEmailPathObject } from './users/verifyEmailPathObject.js';
import { loginPathObject } from './users/loginPathObject.js';
import { refreshTokensPathObject } from './users/refreshTokensPathObject.js';
import { resetPasswordPathObject } from './users/resetPasswordPathObject.js';
import { logoutPathObject } from './users/logoutPathObject.js';
import { requestPasswordResetPathObject } from './users/requestPasswordResetPathObject.js';
import { ballotPapersPathObject } from './elections/ballotPapersPathObject.js';
import { ballotPaperIdPathObject } from './ballotPapers/ballotPaperIdPathObject.js';
import { ballotPaperSectionsPathObject } from './ballotPapers/ballotPaperSectionsPathObject.js';
import { ballotPaperSectionIdPathObject } from './ballotPaperSections/ballotPaperSectionIdPathObject.js';
import { candidatesPathObject } from './candidates/candidatesPathObject.js';
import { candidateIdPathObject } from './candidates/candidateIdPathObject.js';
import { Parameter } from './globals/parameter.js';
import { voterGroupsPathObject } from './voterGroups/voterGroupsPathObject.js';
import { voterGroupIdPathObject } from './voterGroups/voterGroupIdPathObject.js';
import { getVoterTokensPathObject } from './voterGroups/getVoterTokensPathObject.js';

export const voturaOpenApiSchema: OpenAPIV3.Document = {
  openapi: '3.0.0',
  info: {
    title: 'Votura backend HTTP-API definition',
    description:
      'This is the OpenAPI specification for the communication to the votura backend via the REST-API. The votura frontend and backend communicate via this API.',
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
          'With this JWT access token the user can authenticate and authorize himself against the votura backend.',
      },
    },
  },
  tags: [
    {
      name: Tag.Elections,
      description: 'Managing CRUD operations for elections.',
    },
    {
      name: Tag.Users,
      description: 'Managing CRUD operations for users and sessions.',
    },
    {
      name: Tag.BallotPapers,
      description: 'Managing CRUD operations for ballot papers.',
    },
    {
      name: Tag.BallotPaperSections,
      description: 'Managing CRUD operations for ballot paper sections.',
    },
    {
      name: Tag.Candidates,
      description: 'Managing CRUD operations for candidates.',
    },
    {
      name: Tag.VoterGroups,
      description: 'Managing CRUD operations for voter groups.',
    },
  ],
  paths: {
    [`/elections`]: electionsPathObject,
    [`/elections/{${Parameter.electionId}}`]: electionIdPathObject,
    [`/elections/{${Parameter.electionId}}/freeze`]: freezePathObject,
    [`/elections/{${Parameter.electionId}}/unfreeze`]: unfreezePathObject,
    [`/elections/{${Parameter.electionId}}/ballotPapers`]: ballotPapersPathObject,
    [`/elections/{${Parameter.electionId}}/ballotPapers/{${Parameter.ballotPaperId}}`]:
      ballotPaperIdPathObject,
    [`/elections/{${Parameter.electionId}}/ballotPapers/{${Parameter.ballotPaperId}}/ballotPaperSections`]:
      ballotPaperSectionsPathObject,
    [`/elections/{${Parameter.electionId}}/ballotPapers/{${Parameter.ballotPaperId}}/ballotPaperSections/{${Parameter.ballotPaperSectionId}}`]:
      ballotPaperSectionIdPathObject,
    [`/elections/{${Parameter.electionId}}/candidates`]: candidatesPathObject,
    [`/elections/{${Parameter.electionId}}/candidates/{${Parameter.candidateId}}`]:
      candidateIdPathObject,
    [`/users`]: usersPathObject,
    [`/users/verifyEmail`]: verifyEmailPathObject,
    [`/users/login`]: loginPathObject,
    [`/users/refreshTokens`]: refreshTokensPathObject,
    [`/users/requestPasswordReset`]: requestPasswordResetPathObject,
    [`/users/resetPassword`]: resetPasswordPathObject,
    [`/users/logout`]: logoutPathObject,
    [`/voterGroups`]: voterGroupsPathObject,
    [`/voterGroups/{${Parameter.voterGroupId}}`]: voterGroupIdPathObject,
    [`/voterGroups/{${Parameter.voterGroupId}}/getVoterTokens`]: getVoterTokensPathObject,
  },
};
