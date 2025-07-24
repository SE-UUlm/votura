import type { ApiTokenUser } from '@repo/votura-validators';
import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';
import { app } from '../../src/app.js';
import { generateUserTokens } from '../../src/auth/utils.js';
import { HttpStatusCode } from '../../src/httpStatusCode.js';
import { createUser, findUserBy } from '../../src/services/users.service.js';
import { demoUser } from '../mockData.js';

describe(`DELETE /users`, () => {
  const requestPath = '/users';
  let tokens: ApiTokenUser = { accessToken: '', refreshToken: '' };

  beforeAll(async () => {
    await createUser(demoUser);
    const user1 = await findUserBy({ email: demoUser.email });
    if (user1 === null) {
      throw new Error('Failed to find test user 1');
    }

    tokens = generateUserTokens(user1.id);
  });

  it('204: should delete a user', async () => {
    const res = await request(app)
      .delete(requestPath)
      .set('Authorization', `Bearer ${tokens.accessToken}`);

    expect(res.status).toBe(HttpStatusCode.noContent);
    const result = await findUserBy({ email: demoUser.email });
    expect(result).toBeNull();
  });
});
