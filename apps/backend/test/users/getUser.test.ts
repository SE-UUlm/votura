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
import { demoUser } from '../mockData.js';

describe(`GET /users/{userId}`, () => {
  let requestPath = '';
  let tokens: ApiTokenUser = { accessToken: '', refreshToken: '' };

  beforeAll(async () => {
    await createUser(demoUser);
    const user = await findUserBy({ email: demoUser.email });
    if (user === null) {
      throw new Error('Failed to find test user');
    }

    tokens = generateUserTokens(user.id);
    requestPath = `/users/${user.id}`;
  });

  it('200: should return the account details of the requesting user', async () => {
    const res = await request(app)
      .get(requestPath)
      .set('Authorization', `Bearer ${tokens.accessToken}`);

    expect(res.status).toBe(HttpStatusCode.ok);
    expect(res.type).toBe('application/json');
    const parseResult = selectableUserObject.safeParse(res.body);
    expect(parseResult.success).toBe(true);
    if (parseResult.success) {
      expect(parseResult.data.email).toBe(demoUser.email);
    }
  });

  it('401: should return error for missing access token', async () => {
    const res = await request(app).get(requestPath);
    expect(res.status).toBe(HttpStatusCode.unauthorized);
    expect(res.type).toBe('application/json');
    const parseResult = response401Object.safeParse(res.body);
    expect(parseResult.success).toBe(true);
    expect(parseResult.data?.message).toBe(UserAuthErrorMessages.noToken);
  });
});
