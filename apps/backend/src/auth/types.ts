export interface JwtPayload {
  sub: string; // user id
  type: 'access' | 'refresh';
  iat?: number; // added by jwt.sign automatically
  exp: number;
}

export type RefreshTokenPayload = JwtPayload;

export interface AccessTokenPayload extends JwtPayload {
  jti: string; // JWT ID used for blacklisting
}
