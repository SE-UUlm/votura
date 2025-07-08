import type ms from 'ms';

export const JWT_CONFIG = {
  accessTokenExpiresIn: '15m' as ms.StringValue,
  refreshTokenExpiresIn: '7d' as ms.StringValue,
  algorithm: 'RS256' as const,
};
