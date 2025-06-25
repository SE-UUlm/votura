import type { OpenAPIV3 } from 'openapi-types';
import { uuidObjectSchema } from '../../objects/identifiableObject.js';
import { parameter } from '../globals/parameter.js';

export const electionIdParameter: OpenAPIV3.ParameterObject = {
  name: parameter.electionId,
  in: 'path',
  description: 'The unique identifier for the election.',
  required: true,
  schema: uuidObjectSchema as OpenAPIV3.SchemaObject,
};
