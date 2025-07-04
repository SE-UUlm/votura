import type { OpenAPIV3 } from 'openapi-types';
import { uuidObjectSchema } from '../../objects/identifiableObject.js';
import { parameter } from '../globals/parameter.js';

export const candidateIdParameter: OpenAPIV3.ParameterObject = {
  name: parameter.candidateId,
  in: 'path',
  description:
    'The unique identifier for the candidate. ' +
    'The id must be a valid UUIDv4. ' +
    'The requested candidate must exist in the database. ' +
    'The requesting user must have access to this candidate. ' +
    'The candidate must be a child of the election specified in the path parameter.',
  required: true,
  schema: uuidObjectSchema as OpenAPIV3.SchemaObject,
};
