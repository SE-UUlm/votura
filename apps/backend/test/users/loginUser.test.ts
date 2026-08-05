import {
  apiTokenUserObject,
  authenticatableUserObject,
  response400Object,
  response401Object,
  response429Object,
  type SelectableUser,
} from '@repo/votura-validators';
import request, { type Response } from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';
import { app } from '../../src/app.js';
import { HttpStatusCode } from '../../src/httpStatusCode.js';
import { createUser, findUserBy, setUserVerified } from '../../src/services/users.service.js';

describe(`POST /users/login`, () => {
  let requestPath = '';
  let user: SelectableUser | null = null;
  // create a test user only for this test to not have race conditions with token refresh tests
  const loginUser = authenticatableUserObject.parse({
    email: 'loginUser@votura.org',
    password: 'MyStrong!Password123',
  });

  beforeAll(async () => {
    await createUser({ ...loginUser, role: 'admin', active: true });
    user = await findUserBy({ email: loginUser.email });
    if (user === null) {
      throw new Error('Failed to find test user');
    }

    requestPath = '/users/login';
  });

  const testLogin = async (email: string, password: string): Promise<Response> => {
    return request(app).post(requestPath).send({ email, password });
  };

  // TODO: Uncomment when user verification is implemented (see issue #125)
  //it('403: should return error for unverified user', async () => {
  //  // user is already created but not verified
  //
  //  const res = await request(app).post(requestPath).send({
  //    email: demoUser.email,
  //    password: demoUser.password,
  //  });
  //  expect(res.status).toBe(HttpStatusCode.Forbidden);
  //  expect(res.type).toBe('application/json');
  //  const parseResult = response403Object.safeParse(res.body);
  //  expect(parseResult.success).toBe(true);
  //});

  it('200: should log in a verified active user with valid credentials', async () => {
    if (user === null) {
      throw new Error('Test user not found');
    }

    // set user as verified in db
    await setUserVerified(user.id);

    const res = await testLogin(loginUser.email, loginUser.password);
    expect(res.status).toBe(HttpStatusCode.ok);
    expect(res.type).toBe('application/json');
    const parseResult = apiTokenUserObject.safeParse(res.body);
    expect(parseResult.success).toBe(true);
  });

  it('400: should return error for missing credentials', async () => {
    const res = await request(app).post(requestPath).send({
      email: loginUser.email,
    });
    expect(res.status).toBe(HttpStatusCode.badRequest);
    expect(res.type).toBe('application/json');
    const parseResult = response400Object.safeParse(res.body);
    expect(parseResult.success).toBe(true);
  });

  it('401: should return error for invalid credentials', async () => {
    const res = await testLogin(loginUser.email, loginUser.password + 'invalid');
    expect(res.status).toBe(HttpStatusCode.unauthorized);
    expect(res.type).toBe('application/json');
    const parseResult = response401Object.safeParse(res.body);
    expect(parseResult.success).toBe(true);
  });

  it('401: should return error for inactive users', async () => {
    await createUser({
      email: 'inactiveLoginUser@votura.org',
      password: 'MyStrong!Password123',
      role: 'admin',
      active: false,
    });

    const inactiveUser = await findUserBy({ email: 'inactiveLoginUser@votura.org' });
    if (inactiveUser === null) {
      throw new Error('Failed to create inactive user');
    }

    const res = await testLogin(inactiveUser.email, loginUser.password);
    expect(res.status).toBe(HttpStatusCode.unauthorized);
    expect(res.type).toBe('application/json');
    const parseResult = response401Object.safeParse(res.body);
    expect(parseResult.success).toBe(true);
  });

  it('429: should block logins after three failed login attempts', async () => {
    // Use correct credentials at first to reset the failed login attempts counter
    await testLogin(loginUser.email, loginUser.password);

    const res1 = await testLogin(loginUser.email, loginUser.password + 'invalid');
    expect(res1.status).toBe(HttpStatusCode.unauthorized);

    const res2 = await testLogin(loginUser.email, loginUser.password + 'invalid');
    expect(res2.status).toBe(HttpStatusCode.unauthorized);

    const res3 = await testLogin(loginUser.email, loginUser.password + 'invalid');
    expect(res3.status).toBe(HttpStatusCode.tooManyRequests);
    expect(res3.type).toBe('application/json');
    const parseResult = response429Object.safeParse(res3.body);
    expect(parseResult.success).toBe(true);
    expect(parseResult.data?.retryIn).toBeDefined();
    expect(parseResult.data?.retryIn?.seconds).toBe(8);

    // 4th attempt (even with valid password) should still be blocked
    const res = await testLogin(loginUser.email, loginUser.password);
    expect(res.status).toBe(HttpStatusCode.tooManyRequests);
  });
});
