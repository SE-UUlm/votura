import {
  apiTokenUserObject,
  response401Object,
  type SelectableUser,
} from '@repo/votura-validators';
import request from 'supertest';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { app } from '../../src/app.js';
import type { AccessTokenPayload } from '../../src/auth/types.js';
import { verifyToken } from '../../src/auth/utils.js';
import { HttpStatusCode } from '../../src/httpStatusCode.js';
import {
  blacklistAccessToken,
  createUser,
  deleteUser,
  findUserBy,
  verifyUser,
} from '../../src/services/users.service.js';
import { demoUser } from '../mockData.js';

describe(`POST /users/logout`, () => {
  let requestPath = '';
  let user: SelectableUser | null = null;
  let accessToken: string | null = null;
  let refreshToken: string | null = null;

  beforeAll(async () => {
    await createUser(demoUser);
    user = await findUserBy({ email: demoUser.email });
    if (user === null) {
      throw new Error('Failed to find test user');
    }

    // set user as verified in db
    const verified: boolean = await verifyUser(user.id);
    if (!verified) {
      throw new Error('Failed to verify test user');
    }

    requestPath = '/users/logout';
  });

  beforeEach(async () => {
    // Log in the user to create a session
    const loginResponse = await request(app).post('/users/login').send({
      email: demoUser.email,
      password: demoUser.password,
    });
    if (loginResponse.status !== Number(HttpStatusCode.Ok)) {
      throw new Error('Failed to log in test user, status: ' + loginResponse.status);
    }
    const parseResult = apiTokenUserObject.safeParse(loginResponse.body);
    if (!parseResult.success) {
      throw new Error('Failed to parse login response');
    }

    accessToken = parseResult.data.accessToken;
    refreshToken = parseResult.data.refreshToken;
  });

  it('200: should log out a user with valid access token', async () => {
    if (accessToken === null) {
      throw new Error('Access token is null');
    }

    const res = await request(app).post(requestPath).set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(HttpStatusCode.NoContent);
    expect(res.type).toBe('');
  });

  // Authentication middleware tests
  it('401: should return error because of missing access token', async () => {
    const res = await request(app).post(requestPath);
    expect(res.status).toBe(HttpStatusCode.Unauthorized);
    expect(res.type).toBe('application/json');
    const parseResult = response401Object.safeParse(res.body);
    expect(parseResult.success).toBe(true);
  });

  it('401: should return error because of invalid access token', async () => {
    const res = await request(app).post(requestPath).set('Authorization', 'Bearer invalid_token');
    expect(res.status).toBe(HttpStatusCode.Unauthorized);
    expect(res.type).toBe('application/json');
    const parseResult = response401Object.safeParse(res.body);
    expect(parseResult.success).toBe(true);
  });

  it('401: should return error because of refresh token instead of access token', async () => {
    if (refreshToken === null) {
      throw new Error('Refresh token is null');
    }

    const res = await request(app).post(requestPath).set('Authorization', `Bearer ${refreshToken}`);
    expect(res.status).toBe(HttpStatusCode.Unauthorized);
    expect(res.type).toBe('application/json');
    const parseResult = response401Object.safeParse(res.body);
    expect(parseResult.success).toBe(true);
  });

  it('401: should return error because of blacklisted access token', async () => {
    if (accessToken === null) {
      throw new Error('Access token is null');
    }

    // Simulate blacklisting the access token
    const accessTokenPayload = verifyToken(accessToken) as AccessTokenPayload;
    const expiresAt = new Date(accessTokenPayload.exp * 1000);
    const blacklisted = await blacklistAccessToken(accessTokenPayload.jti, expiresAt);
    if (!blacklisted) {
      throw new Error('Failed to blacklist access token');
    }

    const res = await request(app).post(requestPath).set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(HttpStatusCode.Unauthorized);
    expect(res.type).toBe('application/json');
    const parseResult = response401Object.safeParse(res.body);
    expect(parseResult.success).toBe(true);
  });

  it('401: should return error because of user not found', async () => {
    if (accessToken === null) {
      throw new Error('Access token is null');
    }
    if (user === null) {
      throw new Error('Test user not found');
    }

    // Delete the user before sending the request
    const deletionResult = await deleteUser(user.id);
    if (!deletionResult) {
      throw new Error('Failed to delete test user');
    }

    const res = await request(app).post(requestPath).set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(HttpStatusCode.Unauthorized);
    expect(res.type).toBe('application/json');
    const parseResult = response401Object.safeParse(res.body);
    expect(parseResult.success).toBe(true);
  });
});
