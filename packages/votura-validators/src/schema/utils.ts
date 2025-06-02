import { z } from 'zod/v4';
import { voturaMetadataRegistry } from '../utils.js';
import { OpenAPIV3 } from 'openapi-types';
import {
  Response400Object,
  Response401Object,
  Response403Object,
  Response404Object,
  Response406Object,
  Response415Object,
  Response429Object,
  Response500Object,
} from '../objects/response.js';

export const toJsonSchemaParams: Parameters<typeof z.toJSONSchema>[1] = {
  metadata: voturaMetadataRegistry,
  unrepresentable: 'any',
  override: (ctx) => {
    const def = ctx.zodSchema._zod.def;

    if (def.type === 'bigint') {
      ctx.jsonSchema.type = 'string';
    }
  },
};

export const Response400ObjectSchema = z.toJSONSchema(Response400Object, toJsonSchemaParams);
export const Response401ObjectSchema = z.toJSONSchema(Response401Object, toJsonSchemaParams);
export const Response403ObjectSchema = z.toJSONSchema(Response403Object, toJsonSchemaParams);
export const Response404ObjectSchema = z.toJSONSchema(Response404Object, toJsonSchemaParams);
export const Response406ObjectSchema = z.toJSONSchema(Response406Object, toJsonSchemaParams);
export const Response415ObjectSchema = z.toJSONSchema(Response415Object, toJsonSchemaParams);
export const Response429ObjectSchema = z.toJSONSchema(Response429Object, toJsonSchemaParams);
export const Response500ObjectSchema = z.toJSONSchema(Response500Object, toJsonSchemaParams);

export const defaultResponses: OpenAPIV3.ResponsesObject = {
  400: {
    description:
      'Bad Request. The server cannot or will not process the request due to an apparent client error (e.g., malformed request syntax, size too large, invalid request message framing, or deceptive request routing). Note, the actual error message may be different from the example one.',
    content: {
      'application/json': {
        schema: Response400ObjectSchema as OpenAPIV3.SchemaObject,
      },
    },
  },
  401: {
    description:
      'Unauthorized. The request has not been applied because the user does not have valid authentication credentials for the target resource. Note, the actual error message may be different from the example one.',
    content: {
      'application/json': {
        schema: Response401ObjectSchema as OpenAPIV3.SchemaObject,
      },
    },
  },
  403: {
    description:
      'Forbidden. The request contained valid data and was understood by the server, but the server is refusing action. This may be due to the user not having the necessary permissions for a resource or needing an account of some sort, or attempting a prohibited action (e.g. creating a duplicate record where only one is allowed). The request should not be repeated. Note, the actual error message may be different from the example one.',
    content: {
      'application/json': {
        schema: Response403ObjectSchema as OpenAPIV3.SchemaObject,
      },
    },
  },
  404: {
    description:
      'Not Found. The requested resource could not be found but may be available in the future. Subsequent requests by the client are permissible. Note, the actual error message may be different from the example one.',
    content: {
      'application/json': {
        schema: Response404ObjectSchema as OpenAPIV3.SchemaObject,
      },
    },
  },
  406: {
    description:
      'Not Acceptable. The requested resource is capable of generating only content not acceptable according to the Accept headers sent in the request.',
    content: {
      'application/json': {
        schema: Response406ObjectSchema as OpenAPIV3.SchemaObject,
      },
    },
  },
  415: {
    description:
      'Unsupported Media Type. The request entity has a media type which the server or resource does not support. For example, the client uses the content type: text/plain, but the server requires application/json.',
    content: {
      'application/json': {
        schema: Response415ObjectSchema as OpenAPIV3.SchemaObject,
      },
    },
  },
  429: {
    description:
      'Too Many Requests. The user has sent too many requests in a given amount of time.',
    content: {
      'application/json': {
        schema: Response429ObjectSchema as OpenAPIV3.SchemaObject,
      },
    },
  },
  500: {
    description:
      'Internal Server Error. A generic error message, given when an unexpected condition was encountered and no more specific message is suitable.',
    content: {
      'application/json': {
        schema: Response500ObjectSchema as OpenAPIV3.SchemaObject,
      },
    },
  },
};
