import {OpenAPIV3} from 'openapi-types';
import {uuidObjectSchema} from '../../objects/identifiableObject.js';
import {Parameter} from '../globals/parameter.js';

export const candidateIdParameter: OpenAPIV3.ParameterObject = {
    name: Parameter.candidateId,
    in: 'path',
    description: 'The unique identifier for the candidate.',
    required: true,
    schema: uuidObjectSchema as OpenAPIV3.SchemaObject,
}