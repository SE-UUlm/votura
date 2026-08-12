import type { ApiTokenUser, SelectableUser } from '@repo/votura-validators';
import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';
import { app } from '../../src/app.js';
import { generateUserTokens } from '../../src/auth/utils.js';
import { HttpStatusCode } from '../../src/httpStatusCode.js';
import { createUser, findUserBy } from '../../src/services/users.service.js';
import { demoUser, demoUser2 } from '../mockData.js';

describe(`DELETE /users/{userId}`, () => {
  let tokens: ApiTokenUser = { accessToken: '', refreshToken: '' };

  let user2: SelectableUser;

  beforeAll(async () => {
    await createUser(demoUser);
    await createUser(demoUser2);
    const u1 = await findUserBy({ email: demoUser.email });
    const u2 = await findUserBy({ email: demoUser2.email });
    if (u1 === null || u2 === null) {
      throw new Error('Failed to find test users');
    }

    tokens = generateUserTokens(u1.id);
    user2 = u2;
  });

  it('204: should delete a user', async () => {
    const requestPath = `/users/${user2.id}`;

    const res = await request(app)
      .delete(requestPath)
      .set('Authorization', `Bearer ${tokens.accessToken}`);

    expect(res.status).toBe(HttpStatusCode.noContent);
    const result = await findUserBy({ email: demoUser.email });
    expect(result).toBeNull();
  });

  it('404: should return 404 if user not found', async () => {
    const nonexistentUserId = '01234567-89ab-cdef-0123-456789abcdef';
    const requestPath = `/users/${nonexistentUserId}`;

    const res = await request(app)
      .delete(requestPath)
      .set('Authorization', `Bearer ${tokens.accessToken}`);

    expect(res.status).toBe(HttpStatusCode.notFound);
  });
});
