import { OpenAPIV3 } from 'openapi-types';
import { uuidObjectSchema } from '../../objects/identifiableObject.js';

export const ballotPaperSectionIdParameter: OpenAPIV3.ParameterObject = {
  name: 'ballotPaperSectionId',
  in: 'path',
  description: 'The unique identifier for the ballot paper section.',
  required: true,
  schema: uuidObjectSchema as OpenAPIV3.SchemaObject,
};
