import { type ApiTokenUser, response401Object } from '@repo/votura-validators';
import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';
import { app } from '../../src/app.js';
import { generateUserTokens } from '../../src/auth/utils.js';
import { HttpStatusCode } from '../../src/httpStatusCode.js';
import { UserAuthErrorMessages } from '../../src/middlewares/auth.js';
import { createUser, findUserBy } from '../../src/services/users.service.js';
import { demoUser, demoUser2 } from '../mockData.js';

describe(`DELETE /users/{userId}`, () => {
  let requestPath1 = '';
  let requestPath2 = '';
  let tokens: ApiTokenUser = { accessToken: '', refreshToken: '' };

  beforeAll(async () => {
    await createUser(demoUser);
    await createUser(demoUser2);
    const user1 = await findUserBy({ email: demoUser.email });
    const user2 = await findUserBy({ email: demoUser2.email });
    if (user1 === null || user2 === null) {
      throw new Error('Failed to find test users');
    }

    tokens = generateUserTokens(user1.id);
    requestPath1 = `/users/${user1.id}`;
    requestPath2 = `/users/${user2.id}`;
  });

  it('204: should delete the user', async () => {
    const res = await request(app)
      .delete(requestPath2)
      .set('Authorization', `Bearer ${tokens.accessToken}`);

    expect(res.status).toBe(HttpStatusCode.noContent);
    const result = await findUserBy({ email: demoUser2.email });
    expect(result).toBeNull();
  });

  it('401: should return error for missing access token', async () => {
    const res = await request(app).delete(requestPath2);
    expect(res.status).toBe(HttpStatusCode.unauthorized);
    expect(res.type).toBe('application/json');
    const parseResult = response401Object.safeParse(res.body);
    expect(parseResult.success).toBe(true);
    expect(parseResult.data?.message).toBe(UserAuthErrorMessages.noToken);
  });

  it('403: should not allow to delete own account', async () => {
    const res = await request(app)
      .delete(requestPath1)
      .set('Authorization', `Bearer ${tokens.accessToken}`);

    expect(res.status).toBe(HttpStatusCode.forbidden);
  });

  it('404: should not allow to delete non-existing accounts', async () => {
    const nonexistentRequestPath = '/users/01234567-89ab-cdef-0123-456789abcdef';
    const res = await request(app)
      .delete(nonexistentRequestPath)
      .set('Authorization', `Bearer ${tokens.accessToken}`);

    console.log(res.body);

    expect(res.status).toBe(HttpStatusCode.notFound);
  });
});
