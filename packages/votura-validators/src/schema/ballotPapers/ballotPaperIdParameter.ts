import type { OpenAPIV3 } from 'openapi-types';
import { uuidObjectSchema } from '../../objects/identifiableObject.js';
import { Parameter } from '../globals/parameter.js';

export const ballotPaperIdParameter: OpenAPIV3.ParameterObject = {
  name: Parameter.ballotPaperId,
  in: 'path',
  description: 'The ID of the election for which you want to get the ballot papers.',
  required: true,
  schema: uuidObjectSchema as OpenAPIV3.SchemaObject,
};
