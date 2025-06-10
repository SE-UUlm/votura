import {OpenAPIV3} from 'openapi-types';
import {uuidObjectSchema} from '../../objects/identifiableObject.js';

export const candidateIdParameter: OpenAPIV3.ParameterObject = {
    name: 'candidateId',
    in: 'path',
    description: 'The unique identifier for the candidate.',
    required: true,
    schema: uuidObjectSchema as OpenAPIV3.SchemaObject,
}