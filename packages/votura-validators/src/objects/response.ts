import { z, type ZodError } from 'zod/v4';
import { voturaMetadataRegistry } from '../voturaMetadateRegistry.js';

export const response400Object = z.object({
  message: z.string().min(1).max(256).register(voturaMetadataRegistry, {
    example: 'The request was invalid, the server cannot process it.',
  }),
});

export type Response400 = z.infer<typeof response400Object>;

export const zodErrorToResponse400 = (error: ZodError): Response400 => {
  const mappedIssues = error.issues.map(
    (issue, index) => `Error ${index} - ${issue.message} on '${issue.path.join('/')}'`,
  );

  const combinedIssues = mappedIssues.reduce((previousValue, currentValue, currentIndex) => {
    if (currentIndex === 0) {
      return previousValue + currentValue;
    }
    return previousValue + '; ' + currentValue;
  }, '');

  return {
    message: combinedIssues,
  };
};

export const response401Object = z.object({
  message: z.string().min(1).max(256).register(voturaMetadataRegistry, {
    example: 'Invalid authentication, please check your credentials.',
  }),
});

export type Response401 = z.infer<typeof response401Object>;

export const response403Object = z.object({
  message: z.string().min(1).max(256).register(voturaMetadataRegistry, {
    example: 'The user is not authorized to do this action, please check your permissions.',
  }),
});

export type Response403 = z.infer<typeof response403Object>;

export const response404Object = z.object({
  message: z.string().min(1).max(256).register(voturaMetadataRegistry, {
    example: 'The requested resource was not found.',
  }),
});

export type Response404 = z.infer<typeof response404Object>;

export const response406Object = z.object({
  message: z.string().min(1).max(256).register(voturaMetadataRegistry, {
    example: 'The server is not able to generate a response that is acceptable by the client.',
  }),
});

export type Response406 = z.infer<typeof response406Object>;

export const response409Object = z.object({
  message: z.string().min(1).max(256).register(voturaMetadataRegistry, {
    example:
      'Conflict. Indicates that the request could not be processed because of conflict in the current state of the resource.',
  }),
});

export type Response409 = z.infer<typeof response409Object>;

export const response415Object = z.object({
  message: z.string().min(1).max(256).register(voturaMetadataRegistry, {
    example: 'Content-Type is not supported. Please provide only supported content types.',
  }),
});

export type Response415 = z.infer<typeof response415Object>;

export const response429Object = z.object({
  message: z.string().min(1).max(256).register(voturaMetadataRegistry, {
    example: 'Too many requests, please try again later.',
  }),
});

export type Response429 = z.infer<typeof response429Object>;

export const response500Object = z.object({
  message: z.string().min(1).max(256).register(voturaMetadataRegistry, {
    example: 'Internal Server Error. This should not happen, please report the issue.',
  }),
});

export type Response500 = z.infer<typeof response500Object>;
