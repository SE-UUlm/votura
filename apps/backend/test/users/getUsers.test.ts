import { selectableUserObject, type ApiTokenUser } from '@repo/votura-validators';
import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';
import { app } from '../../src/app.js';
import { generateUserTokens } from '../../src/auth/utils.js';
import { HttpStatusCode } from '../../src/httpStatusCode.js';
import { createUser, findUserBy } from '../../src/services/users.service.js';
import { demoUser, demoUser2 } from '../mockData.js';

describe(`GET /users`, () => {
  const requestPath = '/users';
  let tokens: ApiTokenUser = { accessToken: '', refreshToken: '' };

  beforeAll(async () => {
    await createUser(demoUser);
    const user = await findUserBy({ email: demoUser.email });
    if (user === null) {
      throw new Error('Failed to find test user');
    }

    tokens = generateUserTokens(user.id);
  });

  it('200: should return the single user who is in the database', async () => {
    const res = await request(app)
      .get(requestPath)
      .set('Authorization', `Bearer ${tokens.accessToken}`);

    expect(res.status).toBe(HttpStatusCode.ok);
    expect(res.type).toBe('application/json');
    const parseResult = selectableUserObject.array().safeParse(res.body);
    expect(parseResult.success).toBe(true);
    if (parseResult.success) {
      expect(parseResult.data.length).toBe(1);
      expect(parseResult.data[0]?.email).toBe(demoUser.email);
    }
  });

  it('200: should return more users when a new one is created', async () => {
    await createUser(demoUser2);

    const res = await request(app)
      .get(requestPath)
      .set('Authorization', `Bearer ${tokens.accessToken}`);

    expect(res.status).toBe(HttpStatusCode.ok);
    expect(res.type).toBe('application/json');
    const parseResult = selectableUserObject.array().safeParse(res.body);
    if (parseResult.success) {
      expect(parseResult.data.length).toBe(2);
    }
  });
});
