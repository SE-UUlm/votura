import {
  apiTokenUserObject,
  insertableUserObject,
  response400Object,
  response401Object,
  type SelectableUser,
} from '@repo/votura-validators';
import request from 'supertest';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { app } from '../../src/app.js';
import { HttpStatusCode } from '../../src/httpStatusCode.js';
import { UserAuthErrorMessages } from '../../src/middlewares/auth.js';
import { ChangePasswordRequestValidationErrorMessage } from '../../src/controllers/.bodyChecks/userChecks/changePasswordRequest.check.js';
import {
  createUser,
  findUserBy,
  setUserVerified,
} from '../../src/services/users.service.js';

describe(`POST /users/changePassword`, () => {
  let requestPath = '';
  let user: SelectableUser | null = null;
  let accessToken: string | null = null;

  const initialPassword = 'MyInitial!Password123';
  let currentPassword = initialPassword;

  const userCredentials = insertableUserObject.parse({
    email: 'changePasswordUser@votura.org',
    password: initialPassword,
  });

  beforeAll(async () => {
    await createUser(userCredentials);
    user = await findUserBy({ email: userCredentials.email });
    if (user === null) {
      throw new Error('Failed to find test user');
    }

    await setUserVerified(user.id);
    requestPath = '/users/changePassword';
  });

  beforeEach(async () => {
    // Log in user with current password to get a fresh access token
    const loginResponse = await request(app).post('/users/login').send({
      email: userCredentials.email,
      password: currentPassword,
    });

    if (loginResponse.status !== Number(HttpStatusCode.ok)) {
      throw new Error('Failed to log in test user, status: ' + loginResponse.status);
    }

    const parseResult = apiTokenUserObject.safeParse(loginResponse.body);
    if (!parseResult.success) {
      throw new Error('Failed to parse login response');
    }

    accessToken = parseResult.data.accessToken;
  });

  it('204: should successfully change password with valid current password and matching new password', async () => {
    if (accessToken === null) {
      throw new Error('Access token is null');
    }

    const newPassword = 'MyNew!Password456';

    const res = await request(app)
      .post(requestPath)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        currentPassword: currentPassword,
        newPassword: newPassword,
        newPasswordVerification: newPassword,
      });

    expect(res.status).toBe(HttpStatusCode.noContent);
    expect(res.type).toBe('');

    // Update tracked password for subsequent requests
    currentPassword = newPassword;

    // Verify login works with the new password
    const loginRes = await request(app).post('/users/login').send({
      email: userCredentials.email,
      password: newPassword,
    });
    expect(loginRes.status).toBe(HttpStatusCode.ok);

    // Verify login fails with the old password
    const oldLoginRes = await request(app).post('/users/login').send({
      email: userCredentials.email,
      password: initialPassword,
    });
    expect(oldLoginRes.status).toBe(HttpStatusCode.unauthorized);
  });

  it('400: should return error when new passwords do not match', async () => {
    if (accessToken === null) {
      throw new Error('Access token is null');
    }

    const res = await request(app)
      .post(requestPath)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        currentPassword: currentPassword,
        newPassword: 'MyNew!Password789',
        newPasswordVerification: 'Different!Password789',
      });

    expect(res.status).toBe(HttpStatusCode.badRequest);
    expect(res.type).toBe('application/json');
    const parseResult = response400Object.safeParse(res.body);
    expect(parseResult.success).toBe(true);
    expect(parseResult.data?.message).toContain('passwords do not match');
  });

  it('400: should return error when new password does not meet requirements', async () => {
    if (accessToken === null) {
      throw new Error('Access token is null');
    }

    const res = await request(app)
      .post(requestPath)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        currentPassword: currentPassword,
        newPassword: 'weak',
        newPasswordVerification: 'weak',
      });

    expect(res.status).toBe(HttpStatusCode.badRequest);
    expect(res.type).toBe('application/json');
    const parseResult = response400Object.safeParse(res.body);
    expect(parseResult.success).toBe(true);
  });

  it('400: should return error when current password is incorrect', async () => {
    if (accessToken === null) {
      throw new Error('Access token is null');
    }

    const res = await request(app)
      .post(requestPath)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        currentPassword: 'Wrong!Password999',
        newPassword: 'MyNew!Password789',
        newPasswordVerification: 'MyNew!Password789',
      });

    expect(res.status).toBe(HttpStatusCode.badRequest);
    expect(res.type).toBe('application/json');
    const parseResult = response400Object.safeParse(res.body);
    expect(parseResult.success).toBe(true);
    expect(parseResult.data?.message).toBe(
      ChangePasswordRequestValidationErrorMessage.invalidCurrentPassword,
    );
  });

  it('400: should return error when request body is incomplete', async () => {
    if (accessToken === null) {
      throw new Error('Access token is null');
    }

    const res = await request(app)
      .post(requestPath)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        currentPassword: currentPassword,
      });

    expect(res.status).toBe(HttpStatusCode.badRequest);
    expect(res.type).toBe('application/json');
    const parseResult = response400Object.safeParse(res.body);
    expect(parseResult.success).toBe(true);
  });

  it('401: should return error because of missing access token', async () => {
    const res = await request(app).post(requestPath).send({
      currentPassword: currentPassword,
      newPassword: 'MyNew!Password789',
      newPasswordVerification: 'MyNew!Password789',
    });

    expect(res.status).toBe(HttpStatusCode.unauthorized);
    expect(res.type).toBe('application/json');
    const parseResult = response401Object.safeParse(res.body);
    expect(parseResult.success).toBe(true);
    expect(parseResult.data?.message).toBe(UserAuthErrorMessages.noToken);
  });
});
