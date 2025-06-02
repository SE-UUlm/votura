import { z } from 'zod/v4';
import { IdentifiableTimestampedObject } from '../utils.js';

export const UserObject = z.object({
  ...IdentifiableTimestampedObject.shape,
  email: z.email(),
  passwordHash: z.string(),
  verified: z.boolean(),
  emailVerificationTokenHash: z.string().optional(),
  emailVerificationTokenExpiresAt: z.iso.datetime().optional(),
  passwordResetTokenHash: z.string().optional(),
  passwordResetTokenExpiresAt: z.iso.datetime().optional(),
  refreshTokenHash: z.string().optional(),
  refreshTokenExpiresAt: z.iso.datetime().optional(),
});

export type User = z.infer<typeof UserObject>;

export const InsertableUserObject = UserObject.pick({ email: true }).extend({
  password: z
    .string()
    .min(12)
    .max(128)
    .regex(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-])$/),
});

export type InsertableUser = z.infer<typeof InsertableUserObject>;
