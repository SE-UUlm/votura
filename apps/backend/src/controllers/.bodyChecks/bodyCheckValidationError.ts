import type { HttpStatusCode } from '../../httpStatusCode.js';

export interface BodyCheckValidationError {
  status: HttpStatusCode;
  message: string;
}

export function isBodyCheckValidationError(value: unknown): value is BodyCheckValidationError {
  return typeof value === 'object' && value !== null && 'status' in value && 'message' in value;
}
