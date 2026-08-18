import { response401Object, type ApiTokenUser } from '@repo/votura-validators';
import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';
import { app } from '../../src/app.js';
import { generateUserTokens } from '../../src/auth/utils.js';
import { HttpStatusCode } from '../../src/httpStatusCode.js';
import { UserAuthErrorMessages } from '../../src/middlewares/auth.js';
import { createUser, findUserBy } from '../../src/services/users.service.js';
import { demoUser, demoUser2 } from '../mockData.js';

describe(`POST /users/{userId}`, () => {
  let requestPath1 = '';
  let requestPath2 = '';
  let tokens: ApiTokenUser = { accessToken: '', refreshToken: '' };
  const exampleEdit = { role: 'admin', active: true };

  beforeAll(async () => {
    await createUser(demoUser);
    await createUser(demoUser2);
    const user1 = await findUserBy({ email: demoUser.email });
    const user2 = await findUserBy({ email: demoUser2.email });
    if (user1 === null || user2 === null) {
      throw new Error('Failed to find test users');
    }

    tokens = generateUserTokens(user1.id);
    requestPath2 = `/users/${user1.id}`;
    requestPath2 = `/users/${user2.id}`;
  });

  it('200: should save the new account details', async () => {
    const res = await request(app)
      .post(requestPath2)
      .set('Authorization', `Bearer ${tokens.accessToken}`)
      .send(exampleEdit);

    expect(res.status).toBe(HttpStatusCode.noContent);
    expect(res.type).toBe('application/json');

    const updatedUser = await findUserBy({ email: demoUser2.email });
    expect(updatedUser).not.toBe(null);
    expect(updatedUser?.role).toBe('admin');
    expect(updatedUser?.active).toBe(true);
  });

  it('401: should return error for missing access token', async () => {
    const res = await request(app).post(requestPath2).send(exampleEdit);
    expect(res.status).toBe(HttpStatusCode.unauthorized);
    expect(res.type).toBe('application/json');
    const parseResult = response401Object.safeParse(res.body);
    expect(parseResult.success).toBe(true);
    expect(parseResult.data?.message).toBe(UserAuthErrorMessages.noToken);
  });

  it('403: should not allow to edit own account', async () => {
    const res = await request(app)
      .post(requestPath1)
      .set('Authorization', `Bearer ${tokens.accessToken}`)
      .send(exampleEdit);

    expect(res.status).toBe(HttpStatusCode.forbidden);
    expect(res.type).toBe('application/json');
  });

  it('404: should not allow to edit non-existing accounts', async () => {
    const nonexistentRequestPath = '/users/01234567-89ab-cdef-0123-456789abcdef';
    const res = await request(app)
      .post(nonexistentRequestPath)
      .set('Authorization', `Bearer ${tokens.accessToken}`)
      .send(exampleEdit);

    expect(res.status).toBe(HttpStatusCode.notFound);
    expect(res.type).toBe('application/json');
  });
});
