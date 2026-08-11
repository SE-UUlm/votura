import type { ApiTokenUser } from '@repo/votura-validators';
import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';
import { app } from '../../src/app.js';
import { generateUserTokens } from '../../src/auth/utils.js';
import { HttpStatusCode } from '../../src/httpStatusCode.js';
import { createUser, findUserBy } from '../../src/services/users.service.js';
import {demoUser, demoUser2} from '../mockData.js';

describe(`DELETE /users/{userId}`, () => {
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
    const user2 = await findUserBy({ email: demoUser2.email });
    if (user2 === null) {
      throw new Error('Failed to find test user 2');
    }

    const requestPath = `/users/${user2.id}`;

    const res = await request(app)
      .delete(requestPath)
      .set('Authorization', `Bearer ${tokens.accessToken}`);

    expect(res.status).toBe(HttpStatusCode.noContent);
    const result = await findUserBy({ email: demoUser.email });
    expect(result).toBeNull();
  });

  it('404: should return 404 if user not found', async () => {
    const nonexistentUserId = '00000000-0000-0000-0000-000000000000';
    const requestPath = `/users/${nonexistentUserId}`;

    const res = await request(app)
      .delete(requestPath)
      .set('Authorization', `Bearer ${tokens.accessToken}`);

    expect(res.status).toBe(HttpStatusCode.notFound);
  });
});
