import type { OpenAPIV3 } from 'openapi-types';
import { uuidObjectSchema } from '../../objects/identifiableObject.js';
import { parameter } from '../globals/parameter.js';

export const voterGroupIdParameter: OpenAPIV3.ParameterObject = {
  name: parameter.voterGroupId,
  in: 'path',
  description: 'The unique identifier for the voter group.',
  required: true,
  schema: uuidObjectSchema as OpenAPIV3.SchemaObject,
};
