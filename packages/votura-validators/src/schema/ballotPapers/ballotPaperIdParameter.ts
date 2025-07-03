import type { OpenAPIV3 } from 'openapi-types';
import { uuidObjectSchema } from '../../objects/identifiableObject.js';
import { parameter } from '../globals/parameter.js';

export const ballotPaperIdParameter: OpenAPIV3.ParameterObject = {
  name: parameter.ballotPaperId,
  in: 'path',
  description:
    'The unique identifier for the ballot paper. ' +
    'The requested ballot paper must exist in the database. ' +
    'The requesting user must have access to this ballot paper. ' +
    'The ballot paper must be a child of the election specified in the path parameter.',
  required: true,
  schema: uuidObjectSchema as OpenAPIV3.SchemaObject,
};
