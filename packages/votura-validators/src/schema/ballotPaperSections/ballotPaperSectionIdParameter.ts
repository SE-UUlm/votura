import type { OpenAPIV3 } from 'openapi-types';
import { uuidObjectSchema } from '../../objects/identifiableObject.js';
import { parameter } from '../globals/parameter.js';

export const ballotPaperSectionIdParameter: OpenAPIV3.ParameterObject = {
  name: parameter.ballotPaperSectionId,
  in: 'path',
  description:
    'The unique identifier for the ballot paper section. ' +
    'The id must be a valid UUIDv4. ' +
    'The requested ballot paper section must exist in the database. ' +
    'The requesting user must have access to this ballot paper section. ' +
    'The ballot paper section must be a child of the ballot paper specified in the path parameter.',
  required: true,
  schema: uuidObjectSchema as OpenAPIV3.SchemaObject,
};
