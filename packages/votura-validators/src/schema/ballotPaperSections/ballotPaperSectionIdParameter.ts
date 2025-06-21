import type { OpenAPIV3 } from 'openapi-types';
import { uuidObjectSchema } from '../../objects/identifiableObject.js';
import { Parameter } from '../globals/parameter.js';

export const ballotPaperSectionIdParameter: OpenAPIV3.ParameterObject = {
  name: Parameter.ballotPaperSectionId,
  in: 'path',
  description:
    'The unique identifier for the ballot paper section.' +
    'The requested ballot paper section must exist in the database.' +
    'The requesting user must have access to this ballot paper section.',
  required: true,
  schema: uuidObjectSchema as OpenAPIV3.SchemaObject,
};
