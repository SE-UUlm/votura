import { z } from 'zod/v4';
import { IdentifiableTimestampedObject } from './identifiableTimestampedObject.js';
import { toJsonSchemaParams } from '../parserParams.js';
import { voturaMetadataRegistry } from '../voturaMetadateRegistry.js';

export const UserObject = z.object({
  ...IdentifiableTimestampedObject.shape,
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

export type User = z.infer<typeof UserObject>;

export const InsertableUserObject = UserObject.pick({ email: true, password: true });

export type InsertableUser = z.infer<typeof InsertableUserObject>;

export const InsertableUserObjectSchema = z.toJSONSchema(InsertableUserObject, toJsonSchemaParams);

export const ApiTokenUserObject = UserObject.pick({
  refreshToken: true,
  accessToken: true,
});

export type ApiTokenUser = z.infer<typeof ApiTokenUserObject>;

export const ApiTokenUserObjectSchema = z.toJSONSchema(ApiTokenUserObject, toJsonSchemaParams);

export const RefreshRequestUserObject = UserObject.pick({
  refreshToken: true,
});

export type RefreshRequestUser = z.infer<typeof RefreshRequestUserObject>;

export const RefreshRequestUserObjectSchema = z.toJSONSchema(
  RefreshRequestUserObject,
  toJsonSchemaParams,
);

export const RequestPasswordResetUserObject = UserObject.pick({
  email: true,
});

export type RequestPasswordResetUser = z.infer<typeof RequestPasswordResetUserObject>;

export const RequestPasswordResetUserObjectSchema = z.toJSONSchema(
  RequestPasswordResetUserObject,
  toJsonSchemaParams,
);

export const PasswordResetUserObject = UserObject.pick({
  passwordResetTokenHash: true,
});

export type PasswordResetUser = z.infer<typeof PasswordResetUserObject>;

export const PasswordResetUserObjectSchema = z.toJSONSchema(
  PasswordResetUserObject,
  toJsonSchemaParams,
);
