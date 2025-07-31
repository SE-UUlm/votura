import { z, type ZodError } from 'zod/v4';
import { voturaMetadataRegistry } from '../voturaMetadateRegistry.js';

export const responseObject = z.object({
  message: z.string().min(1).max(256).register(voturaMetadataRegistry, {
    example: 'A detailed message about the response.',
    description: 'A message that provides additional information about the response.',
  }),
});

export const response400Object = z.object({
  ...responseObject.shape,
  message: z
    .string()
    .min(1)
    .max(256)
    .default('Bad Request. The request was invalid, the server cannot process it.')
    .register(voturaMetadataRegistry, {
      example: 'Bad Request. The request was invalid, the server cannot process it.',
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
  ...responseObject.shape,
  message: z
    .string()
    .min(1)
    .max(256)
    .default('Invalid authentication, please check your credentials.')
    .register(voturaMetadataRegistry, {
      example: 'Invalid authentication, please check your credentials.',
    }),
});

export type Response401 = z.infer<typeof response401Object>;

export const response403Object = z.object({
  ...responseObject.shape,
  message: z
    .string()
    .min(1)
    .max(256)
    .default('The user is not authorized to do this action, please check your permissions.')
    .register(voturaMetadataRegistry, {
      example: 'The user is not authorized to do this action, please check your permissions.',
    }),
});

export type Response403 = z.infer<typeof response403Object>;

export const response404Object = z.object({
  ...responseObject.shape,
  message: z
    .string()
    .min(1)
    .max(256)
    .default('Not Found. The requested resource was not found.')
    .register(voturaMetadataRegistry, {
      example: 'The requested resource was not found.',
    }),
});

export type Response404 = z.infer<typeof response404Object>;

export const response406Object = z.object({
  ...responseObject.shape,
  message: z
    .string()
    .min(1)
    .max(256)
    .default(
      'Not Acceptable. The server is not able to generate a response that is acceptable by the client.',
    )
    .register(voturaMetadataRegistry, {
      example: 'The server is not able to generate a response that is acceptable by the client.',
    }),
});

export type Response406 = z.infer<typeof response406Object>;

export const response409Object = z.object({
  ...responseObject.shape,
  message: z
    .string()
    .min(1)
    .max(256)
    .default(
      'Conflict. Conflict in the current state of the resource, request could not be processed.',
    )
    .register(voturaMetadataRegistry, {
      example:
        'Conflict. Conflict in the current state of the resource, request could not be processed.',
      description:
        'Indicates that the request could not be processed because of conflict in the current state of the resource.',
    }),
});

export type Response409 = z.infer<typeof response409Object>;

export const response415Object = z.object({
  ...responseObject.shape,
  message: z
    .string()
    .min(1)
    .max(256)
    .default('Content-Type is not supported. Please provide only supported content types.')
    .register(voturaMetadataRegistry, {
      example: 'Content-Type is not supported. Please provide only supported content types.',
    }),
});

export type Response415 = z.infer<typeof response415Object>;

export const response429Object = z.object({
  ...responseObject.shape,
  message: z
    .string()
    .min(1)
    .max(256)
    .default('Too many requests, please try again later.')
    .register(voturaMetadataRegistry, {
      example: 'Too many requests, please try again later.',
    }),
});

export type Response429 = z.infer<typeof response429Object>;

export const response500Object = z.object({
  ...responseObject.shape,
  message: z
    .string()
    .min(1)
    .max(256)
    .default('Internal Server Error. This should not happen, please report the issue.')
    .register(voturaMetadataRegistry, {
      example: 'Internal Server Error. This should not happen, please report the issue.',
    }),
});

export type Response500 = z.infer<typeof response500Object>;
