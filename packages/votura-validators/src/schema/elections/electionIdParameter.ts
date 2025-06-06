import { uuidObjectSchema } from '../../objects/identifiableObject.js';
import { OpenAPIV3 } from 'openapi-types';

export const electionIdParameter: OpenAPIV3.ParameterObject = {
  name: 'electionId',
  in: 'path',
  description: 'The unique identifier for the election.',
  required: true,
  schema: uuidObjectSchema as OpenAPIV3.SchemaObject,
};
