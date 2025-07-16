import {
  apiTokenUserObject,
  response400Object,
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
  createUser,
  deleteUser,
  findUserBy,
  verifyUser,
} from '../../src/services/users.service.js';
import { demoUser } from '../mockData.js';
import { sleep } from '../utils.js';

describe(`POST /users/refreshTokens`, () => {
  const requestPath = '/users/refreshTokens';
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
  });

  beforeEach(async () => {
    // Log in the user to create a session
    const loginResponse = await request(app).post('/users/login').send({
      email: demoUser.email,
      password: demoUser.password,
    });
    if (loginResponse.status !== Number(HttpStatusCode.ok)) {
      throw new Error('Failed to log in test user');
    }
    const parseResult = apiTokenUserObject.safeParse(loginResponse.body);
    if (!parseResult.success) {
      throw new Error('Failed to parse login response');
    }

    accessToken = parseResult.data.accessToken;
    refreshToken = parseResult.data.refreshToken;
  });

  it('200: should refresh tokens for a valid refresh token', async () => {
    if (accessToken === null || refreshToken === null) {
      throw new Error('Access or refresh token is null');
    }
    if (user === null) {
      throw new Error('Test user not found');
    }

    const res = await request(app).post(requestPath).send({ refreshToken: refreshToken });

    expect(res.status).toBe(HttpStatusCode.ok);
    expect(res.type).toBe('application/json');
    const parseResult = apiTokenUserObject.safeParse(res.body);
    expect(parseResult.success).toBe(true);
    if (!parseResult.success) {
      throw new Error('Failed to parse refresh response');
    }

    // Verify the new access token
    const newAccessToken = parseResult.data.accessToken;
    const decodedPayload = verifyToken(newAccessToken) as AccessTokenPayload;
    const decodedRefreshToken = verifyToken(parseResult.data.refreshToken);
    expect(decodedPayload.sub).toBe(user.id);
    expect(decodedRefreshToken?.sub).toBe(user.id);
  });

  it('401: should return error for invalid refresh token', async () => {
    const res = await request(app).post(requestPath).send({ refreshToken: 'invalid.token.test' });

    expect(res.status).toBe(HttpStatusCode.unauthorized);
    expect(res.type).toBe('application/json');
    const parseResult = response401Object.safeParse(res.body);
    expect(parseResult.success).toBe(true);
  });

  it('401: should return error for using access token as refresh token', async () => {
    if (accessToken === null) {
      throw new Error('Access token is null');
    }

    const res = await request(app).post(requestPath).send({ refreshToken: accessToken });

    expect(res.status).toBe(HttpStatusCode.unauthorized);
    expect(res.type).toBe('application/json');
    const parseResult = response401Object.safeParse(res.body);
    expect(parseResult.success).toBe(true);
  });

  it('401: should return error for using old refresh token', async () => {
    if (refreshToken === null) {
      throw new Error('Refresh token is null');
    }

    // refresh tokens once to expire the current refresh token
    // wait for a bit to ensure the new refresh token has a different expiresAt
    await sleep(1500);
    const res = await request(app).post(requestPath).send({ refreshToken: refreshToken });
    expect(res.status).toBe(HttpStatusCode.ok);

    // Attempt to use the old refresh token
    const expiredRes = await request(app).post(requestPath).send({ refreshToken: refreshToken });
    expect(expiredRes.status).toBe(HttpStatusCode.unauthorized);
    expect(expiredRes.type).toBe('application/json');
    const parseResult = response401Object.safeParse(expiredRes.body);
    expect(parseResult.success).toBe(true);
  });

  it('400: should return error for missing refresh token', async () => {
    const res = await request(app).post(requestPath).send({});

    expect(res.status).toBe(HttpStatusCode.badRequest);
    expect(res.type).toBe('application/json');
    const parseResult = response400Object.safeParse(res.body);
    expect(parseResult.success).toBe(true);
  });

  it('401: should return error for missing user in database', async () => {
    if (refreshToken === null) {
      throw new Error('Refresh token is null');
    }
    if (user === null) {
      throw new Error('Test user not found');
    }

    // Delete the user to simulate missing user
    await deleteUser(user.id);
    user = null;

    const res = await request(app).post(requestPath).send({ refreshToken: refreshToken });

    expect(res.status).toBe(HttpStatusCode.unauthorized);
    expect(res.type).toBe('application/json');
    const parseResult = response401Object.safeParse(res.body);
    expect(parseResult.success).toBe(true);
  });
});
