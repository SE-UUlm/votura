import { db } from '../db/database.js';

export const cleanupExpiredTokens = async (): Promise<void> => {
  // Remove expired blacklisted tokens
  await db.deleteFrom('AccessTokenBlacklist').where('expiresAt', '<', new Date()).execute();

  // Clean up expired refresh tokens from users
  await db
    .updateTable('User')
    .set({
      refreshTokenHash: null,
      refreshTokenExpiresAt: null,
    })
    .where('refreshTokenExpiresAt', '<', new Date())
    .execute();
};
