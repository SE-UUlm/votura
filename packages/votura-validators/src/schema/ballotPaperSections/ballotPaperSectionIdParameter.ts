import type { OpenAPIV3 } from 'openapi-types';
import { uuidObjectSchema } from '../../objects/identifiableObject.js';
import { parameter } from '../globals/parameter.js';

export const ballotPaperSectionIdParameter: OpenAPIV3.ParameterObject = {
  name: parameter.ballotPaperSectionId,
  in: 'path',
  description: 'The unique identifier for the ballot paper section.',
  required: true,
  schema: uuidObjectSchema as OpenAPIV3.SchemaObject,
};
