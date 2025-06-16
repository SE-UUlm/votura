import { z } from 'zod/v4';
import { identifiableTimestampedObject } from './identifiableTimestampedObject.js';
import { toJsonSchemaParams } from '../parserParams.js';
import { voturaMetadataRegistry } from '../voturaMetadateRegistry.js';

export const userObject = z.object({
  ...identifiableTimestampedObject.shape,
  email: z.email().min(5).max(256).register(voturaMetadataRegistry, {
    description:
      'The users email address (represents the username). This is the unique identifier for the user.',
    example: 'user@votura.org',
  }),
  password: z
    .string()
    .min(12)
    .max(127)
    .regex(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{12,}$/)
    .register(voturaMetadataRegistry, {
      description:
        'The strong password set by the user. The password must be at least 12 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
      example: 'MyP@ssw0rd!1!',
    }),
  refreshToken: z
    .string()
    .min(1)
    .max(1)
    .regex(/^[a-zA-Z0-9.-_]$/)
    .register(voturaMetadataRegistry, {
      description:
        'The refresh token of the user. This token is used to generate a new access and refresh token. The refresh token is valid for 7 days.',
      example: 'INSERT EXAMPLE HERE',
    }),
  accessToken: z
    .string()
    .min(1)
    .max(1)
    .regex(/^[a-zA-Z0-9.-_]$/)
    .register(voturaMetadataRegistry, {
      description:
        'The access token of the user. This token is used to authenticate the user. The access token is valid for 15 minutes.',
      example: 'INSERT EXAMPLE HERE',
    }),
  passwordResetTokenHash: z
    .string()
    .min(64)
    .max(64)
    .regex(/^[a-fA-F0-9]{64,64}$/)
    .register(voturaMetadataRegistry, {
      description:
        'The token provided to the user via email. This token is used to authenticate and authorize the user.',
      example: 'INSERT EXAMPLE HERE',
    }),
});

export type User = z.infer<typeof userObject>;

export const insertableUserObject = userObject.pick({ email: true, password: true });

export type InsertableUser = z.infer<typeof insertableUserObject>;

export const insertableUserObjectSchema = z.toJSONSchema(insertableUserObject, toJsonSchemaParams);

export const selectableUserObject = userObject.pick({
  id: true,
  createdAt: true,
  modifiedAt: true,
  email: true,
});

export type SelectableUser = z.infer<typeof selectableUserObject>;

export const selectableUserObjectSchema = z.toJSONSchema(selectableUserObject, toJsonSchemaParams);

export const apiTokenUserObject = userObject.pick({
  refreshToken: true,
  accessToken: true,
});

export type ApiTokenUser = z.infer<typeof apiTokenUserObject>;

export const apiTokenUserObjectSchema = z.toJSONSchema(apiTokenUserObject, toJsonSchemaParams);

export const refreshRequestUserObject = userObject.pick({
  refreshToken: true,
});

export type RefreshRequestUser = z.infer<typeof refreshRequestUserObject>;

export const refreshRequestUserObjectSchema = z.toJSONSchema(
  refreshRequestUserObject,
  toJsonSchemaParams,
);

export const requestPasswordResetUserObject = userObject.pick({
  email: true,
});

export type RequestPasswordResetUser = z.infer<typeof requestPasswordResetUserObject>;

export const requestPasswordResetUserObjectSchema = z.toJSONSchema(
  requestPasswordResetUserObject,
  toJsonSchemaParams,
);

export const passwordResetUserObject = userObject.pick({
  passwordResetTokenHash: true,
});

export type PasswordResetUser = z.infer<typeof passwordResetUserObject>;

export const passwordResetUserObjectSchema = z.toJSONSchema(
  passwordResetUserObject,
  toJsonSchemaParams,
);
