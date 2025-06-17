export interface JwtPayload {
  sub: string; // user id
  type: 'access' | 'refresh';
  iat?: number; // added by jwt.sign automatically
  exp: number;
  jti?: string; // JWT ID for access tokens (used for blacklisting)
}
