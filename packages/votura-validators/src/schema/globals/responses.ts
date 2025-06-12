import type { OpenAPIV3 } from 'openapi-types';
import { toJsonSchemaParams } from '../../parserParams.js';
import { z } from 'zod/v4';
import {
  response400Object,
  response401Object,
  response403Object,
  response404Object,
  response406Object,
  response409Object,
  response415Object,
  response429Object,
  response500Object,
} from '../../objects/response.js';

export const response400: OpenAPIV3.ResponsesObject = {
  400: {
    description:
      'Bad Request. The server cannot or will not process the request due to an apparent client error (e.g., malformed request syntax, size too large, invalid request message framing, or deceptive request routing). Note, the actual error message may be different from the example one.',
    content: {
      'application/json': {
        schema: z.toJSONSchema(response400Object, toJsonSchemaParams) as OpenAPIV3.SchemaObject,
      },
    },
  },
};

export const response401: OpenAPIV3.ResponsesObject = {
  401: {
    description:
      'Unauthorized. The request has not been applied because the user does not have valid authentication credentials for the target resource. Note, the actual error message may be different from the example one.',
    content: {
      'application/json': {
        schema: z.toJSONSchema(response401Object, toJsonSchemaParams) as OpenAPIV3.SchemaObject,
      },
    },
  },
};

export const response403: OpenAPIV3.ResponsesObject = {
  403: {
    description:
      'Forbidden. The request contained valid data and was understood by the server, but the server is refusing action. This may be due to the user not having the necessary permissions for a resource or needing an account of some sort, or attempting a prohibited action (e.g. creating a duplicate record where only one is allowed). The request should not be repeated. Note, the actual error message may be different from the example one.',
    content: {
      'application/json': {
        schema: z.toJSONSchema(response403Object, toJsonSchemaParams) as OpenAPIV3.SchemaObject,
      },
    },
  },
};

export const response404: OpenAPIV3.ResponsesObject = {
  404: {
    description:
      'Not Found. The requested resource could not be found but may be available in the future. Subsequent requests by the client are permissible. Note, the actual error message may be different from the example one.',
    content: {
      'application/json': {
        schema: z.toJSONSchema(response404Object, toJsonSchemaParams) as OpenAPIV3.SchemaObject,
      },
    },
  },
};

export const response406: OpenAPIV3.ResponsesObject = {
  406: {
    description:
      'Not Acceptable. The requested resource is capable of generating only content not acceptable according to the Accept headers sent in the request.',
    content: {
      'application/json': {
        schema: z.toJSONSchema(response406Object, toJsonSchemaParams) as OpenAPIV3.SchemaObject,
      },
    },
  },
};

export const response409: OpenAPIV3.ResponsesObject = {
  409: {
    description:
      'Conflict. Indicates that the request could not be processed because of conflict in the current state of the resource.',
    content: {
      'application/json': {
        schema: z.toJSONSchema(response409Object, toJsonSchemaParams) as OpenAPIV3.SchemaObject,
      },
    },
  },
};

export const response415: OpenAPIV3.ResponsesObject = {
  415: {
    description:
      'Unsupported Media Type. The request entity has a media type which the server or resource does not support. For example, the client uses the content type: text/plain, but the server requires application/json.',
    content: {
      'application/json': {
        schema: z.toJSONSchema(response415Object, toJsonSchemaParams) as OpenAPIV3.SchemaObject,
      },
    },
  },
};

export const response429: OpenAPIV3.ResponsesObject = {
  429: {
    description:
      'Too Many Requests. The user has sent too many requests in a given amount of time.',
    content: {
      'application/json': {
        schema: z.toJSONSchema(response429Object, toJsonSchemaParams) as OpenAPIV3.SchemaObject,
      },
    },
  },
};

export const responseDefault: OpenAPIV3.ResponsesObject = {
  default: {
    description:
      'Internal Server Error. A generic error message, given when an unexpected condition was encountered and no more specific message is suitable.',
    content: {
      'application/json': {
        schema: z.toJSONSchema(response500Object, toJsonSchemaParams) as OpenAPIV3.SchemaObject,
      },
    },
  },
};
