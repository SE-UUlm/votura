import {
  response401Object,
  selectableUserObject,
  type ApiTokenUser,
} from '@repo/votura-validators';
import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';
import { app } from '../../src/app.js';
import { generateUserTokens } from '../../src/auth/utils.js';
import { HttpStatusCode } from '../../src/httpStatusCode.js';
import { UserAuthErrorMessages } from '../../src/middlewares/auth.js';
import { createUser, findUserBy } from '../../src/services/users.service.js';
import { demoUser, demoUser2 } from '../mockData.js';

describe(`GET /users/{userId}`, () => {
  let requestPath1 = '';
  let requestPath2 = '';
  let tokens1: ApiTokenUser = { accessToken: '', refreshToken: '' };
  let tokens2: ApiTokenUser = { accessToken: '', refreshToken: '' };

  beforeAll(async () => {
    await createUser(demoUser);
    await createUser(demoUser2);
    const user1 = await findUserBy({ email: demoUser.email });
    const user2 = await findUserBy({ email: demoUser2.email });
    if (user1 === null || user2 === null) {
      throw new Error('Failed to find test users');
    }

    tokens1 = generateUserTokens(user1.id);
    tokens2 = generateUserTokens(user2.id);
    requestPath1 = `/users/${user1.id}`;
    requestPath2 = `/users/${user2.id}`;
  });

  it('200: should return the account details of the requesting user', async () => {
    const res = await request(app)
      .get(requestPath2)
      .set('Authorization', `Bearer ${tokens2.accessToken}`);

    expect(res.status).toBe(HttpStatusCode.ok);
    expect(res.type).toBe('application/json');
    const parseResult = selectableUserObject.safeParse(res.body);
    expect(parseResult.success).toBe(true);
    if (parseResult.success) {
      expect(parseResult.data.email).toBe(demoUser2.email);
    }
  });

  it('200: should return the account details of another user if admin', async () => {
    const res = await request(app)
      .get(requestPath2)
      .set('Authorization', `Bearer ${tokens1.accessToken}`);

    expect(res.status).toBe(HttpStatusCode.ok);
    expect(res.type).toBe('application/json');
    const parseResult = selectableUserObject.safeParse(res.body);
    expect(parseResult.success).toBe(true);
    if (parseResult.success) {
      expect(parseResult.data.email).toBe(demoUser2.email);
    }
  });

  it('401: should return error for missing access token', async () => {
    const res = await request(app).get(requestPath1);
    expect(res.status).toBe(HttpStatusCode.unauthorized);
    expect(res.type).toBe('application/json');
    const parseResult = response401Object.safeParse(res.body);
    expect(parseResult.success).toBe(true);
    expect(parseResult.data?.message).toBe(UserAuthErrorMessages.noToken);
  });

  it('403: should not allow to get account details of another user if not admin', async () => {
    const res = await request(app)
      .get(requestPath1)
      .set('Authorization', `Bearer ${tokens2.accessToken}`);

    expect(res.status).toBe(HttpStatusCode.forbidden);
  });

  it('404: should return error for non-existing user', async () => {
    const nonexistentRequestPath = '/users/01234567-89ab-cdef-0123-456789abcdef';
    const res = await request(app)
      .get(nonexistentRequestPath)
      .set('Authorization', `Bearer ${tokens1.accessToken}`);

    expect(res.status).toBe(HttpStatusCode.notFound);
  });
});
