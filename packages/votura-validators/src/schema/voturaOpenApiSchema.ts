import { OpenAPIV3 } from 'openapi-types';
import { electionsPathObject } from './elections/electionsPathObject.js';

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
      url: 'http://localhost:{port}/api/v1',
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
      voturaBackendAuth: {
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
      name: 'Elections',
      description: 'It contains all information about the election.',
    },
    {
      name: 'Users',
      description: 'Managing user accounts and sessions.',
    },
  ],
  paths: {
    '/elections': electionsPathObject,
  },
};
