import type { User, Uuid } from '@repo/votura-validators';

export interface UserJwtPayload {
  sub: User['id'];
  iat?: number; // added by jwt.sign automatically
  type: 'refresh' | 'access';
  exp: number;
}

export interface RefreshTokenPayload extends UserJwtPayload {
  type: 'refresh';
}

export interface AccessTokenPayload extends UserJwtPayload {
  type: 'access';
  jti: string; // JWT ID used for blacklisting
}

export interface VoterJwtPayload {
  sub: Uuid;
  iat?: number;
}
