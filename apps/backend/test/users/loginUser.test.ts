import {
  apiTokenUserObject,
  response400Object,
  response401Object,
  type SelectableUser,
} from '@repo/votura-validators';
import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';
import { app } from '../../src/app.js';
import { HttpStatusCode } from '../../src/httpStatusCode.js';
import { createUser, findUserBy, verifyUser } from '../../src/services/users.service.js';
import { demoUser } from '../mockData.js';

describe(`POST /users/login`, () => {
  let requestPath = '';
  let user: SelectableUser | null = null;

  beforeAll(async () => {
    await createUser(demoUser);
    user = await findUserBy({ email: demoUser.email });
    if (user === null) {
      throw new Error('Failed to find test user');
    }

    requestPath = '/users/login';
  });

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

  it('200: should log in a verified user with valid credentials', async () => {
    if (user === null) {
      throw new Error('Test user not found');
    }

    // set user as verified in db
    const verified: boolean = await verifyUser(user.id);
    if (!verified) {
      throw new Error('Failed to verify test user');
    }

    const res = await request(app).post(requestPath).send({
      email: demoUser.email,
      password: demoUser.password,
    });
    expect(res.status).toBe(HttpStatusCode.Ok);
    expect(res.type).toBe('application/json');
    const parseResult = apiTokenUserObject.safeParse(res.body);
    expect(parseResult.success).toBe(true);
  });

  it('400: should return error for missing credentials', async () => {
    const res = await request(app).post(requestPath).send({
      email: demoUser.email,
    });
    expect(res.status).toBe(HttpStatusCode.BadRequest);
    expect(res.type).toBe('application/json');
    const parseResult = response400Object.safeParse(res.body);
    expect(parseResult.success).toBe(true);
  });

  it('401: should return error for invalid credentials', async () => {
    const res = await request(app)
      .post(requestPath)
      .send({
        email: demoUser.email,
        password: demoUser.password + 'invalid',
      });
    expect(res.status).toBe(HttpStatusCode.Unauthorized);
    expect(res.type).toBe('application/json');
    const parseResult = response401Object.safeParse(res.body);
    expect(parseResult.success).toBe(true);
  });
});
