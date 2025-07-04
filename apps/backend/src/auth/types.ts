export interface JwtPayload {
  sub: string; // user id
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
