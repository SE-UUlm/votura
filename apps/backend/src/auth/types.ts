import type { User } from "@repo/votura-validators";

export interface JwtPayload {
  sub: User["id"];
  iat?: number; // added by jwt.sign automatically
  type: 'refresh' | 'access';
  exp: number;
}

export interface RefreshTokenPayload extends JwtPayload {
  type: 'refresh';
}

export interface AccessTokenPayload extends JwtPayload {
  type: 'access';
  jti: string; // JWT ID used for blacklisting
}
