import type { OpenAPIV3 } from 'openapi-types';
import { uuidObjectSchema } from '../../objects/identifiableObject.js';
import { Parameter } from '../globals/parameter.js';

export const electionIdParameter: OpenAPIV3.ParameterObject = {
  name: Parameter.electionId,
  in: 'path',
  description:
    'The unique identifier for the election. ' +
    'The requested election must exist in the database. ' +
    'The requesting user must have access to this election.',
  required: true,
  schema: uuidObjectSchema as OpenAPIV3.SchemaObject,
};
