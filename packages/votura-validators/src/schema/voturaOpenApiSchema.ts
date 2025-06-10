import { OpenAPIV3 } from 'openapi-types';
import { electionsPathObject } from './elections/electionsPathObject.js';
import { Tag } from './globals/tag.js';
import { SecuritySchemaName } from './globals/securitySchemaName.js';
import { electionPathObject } from './elections/electionPathObject.js';
import { freezeElectionPathObject } from './elections/freezeElectionPathObject.js';
import { unfreezeElectionPathObject } from './elections/unfreezeElectionPathObject.js';
import { usersPathObject } from './users/usersPathObject.js';
import { verifyEmailUserPathObject } from './users/verifyEmailUsersPathObject.js';
import { loginUsersPathObject } from './users/loginUsersPathObject.js';
import { refreshTokensUsersPathObject } from './users/refreshTokensUsersPathObject.js';
import { resetPasswordUsersPathObject } from './users/resetPasswordUsersPathObject.js';
import { logoutUsersPathObject } from './users/logoutUsersPathObject.js';
import { requestPasswordResetUsersPathObject } from './users/requestPasswordResetUsersPathObject.js';
import { ballotPapersPathObject } from './ballotPapers/ballotPapersPathObject.js';
import { ballotPapersElectionsPathObject } from './elections/ballotPapersElectionsPathObject.js';
import { ballotPaperPathObject } from './ballotPapers/ballotPaperPathObject.js';
import { ballotPaperSectionsPathObject } from './ballotPaperSections/ballotPaperSectionsPathObject.js';
import { ballotPaperSectionsBallotPapersPathObject } from './ballotPapers/ballotPaperSectionsBallotPapersPathObject.js';
import { ballotPaperSectionPathObject } from './ballotPaperSections/ballotPaperSectionPathObject.js';
import { candidatesPathObject } from './candidates/candidatesPathObject.js';
import { candidateIdPathObject } from './candidates/candidateIdPathObject.js';
import { Parameter } from './globals/parameter.js';

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
          default: '5000',
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
    [`/elections/{${Parameter.electionId}}`]: electionPathObject,
    [`/elections/{${Parameter.electionId}}/freeze`]: freezeElectionPathObject,
    [`/elections/{${Parameter.electionId}}/unfreeze`]: unfreezeElectionPathObject,
    [`/elections/{${Parameter.electionId}}/ballotPapers`]: ballotPapersElectionsPathObject,
    [`/elections/{${Parameter.electionId}}/candidates`]: candidatesPathObject,
    [`/elections/{${Parameter.electionId}}/candidates/{${Parameter.candidateId}}`]:
      candidateIdPathObject,
    [`/users`]: usersPathObject,
    [`/users/verifyEmail`]: verifyEmailUserPathObject,
    [`/users/login`]: loginUsersPathObject,
    [`/users/refreshTokens`]: refreshTokensUsersPathObject,
    [`/users/requestPasswordReset`]: requestPasswordResetUsersPathObject,
    [`/users/resetPassword`]: resetPasswordUsersPathObject,
    [`/users/logout`]: logoutUsersPathObject,
    [`/ballotPapers`]: ballotPapersPathObject,
    [`/ballotPapers/{ballotPaperId}`]: ballotPaperPathObject,
    [`/ballotPapers/{ballotPaperId}/ballotPaperSections`]:
      ballotPaperSectionsBallotPapersPathObject,
    [`/ballotPaperSections`]: ballotPaperSectionsPathObject,
    [`/ballotPaperSections/{ballotPaperSectionId}`]: ballotPaperSectionPathObject,
  },
};
