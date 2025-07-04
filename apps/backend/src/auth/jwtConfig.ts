import type ms from 'ms';

export const JWT_CONFIG = {
  ACCESS_TOKEN_EXPIRES_IN: '15m' as ms.StringValue,
  REFRESH_TOKEN_EXPIRES_IN: '7d' as ms.StringValue,
  ALGORITHM: 'RS256' as const,
};
