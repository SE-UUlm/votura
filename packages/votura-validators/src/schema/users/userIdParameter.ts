import type { OpenAPIV3 } from 'openapi-types';
import { uuidObjectSchema } from '../../objects/identifiableObject.js';
import { parameter } from '../globals/parameter.js';

export const userIdParameter: OpenAPIV3.ParameterObject = {
  name: parameter.userId,
  in: 'path',
  description:
    'The unique identifier for the user. ' +
    'The id must be a valid UUIDv4. ' +
    'The requested user must exist in the database. ' +
    'The requesting user must have access to see the user.',
  required: true,
  schema: uuidObjectSchema as OpenAPIV3.SchemaObject,
};
