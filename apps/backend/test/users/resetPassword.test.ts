import {
  apiTokenUserObject,
  insertableUserObject,
  response400Object,
  response401Object,
  type SelectableUser,
} from '@repo/votura-validators';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { app } from '../../src/app.js';
import { generatePasswordResetToken, hashPasswordResetToken } from '../../src/auth/utils.js';
import { HttpStatusCode } from '../../src/httpStatusCode.js';
import { sendPasswordResetEmail } from '../../src/mail/mailer.js';
import {
  createUser,
  deleteUser,
  findUserBy,
  setPasswordResetToken,
  setUserVerified,
} from '../../src/services/users.service.js';

vi.mock('../../src/mail/mailer.js', () => ({
  sendPasswordResetEmail: vi.fn(),
}));

const mockedSendPasswordResetEmail = vi.mocked(sendPasswordResetEmail);

/**
 * Triggers a password reset via the API and returns the raw token that would
 * have been emailed to the user (captured from the mocked mailer).
 */
const requestResetTokenFor = async (email: string): Promise<string> => {
  mockedSendPasswordResetEmail.mockClear();
  const res = await request(app).post('/users/requestPasswordReset').send({ email });
  if (res.status !== Number(HttpStatusCode.noContent)) {
    throw new Error('Failed to request password reset');
  }
  const call = mockedSendPasswordResetEmail.mock.calls[0];
  if (call === undefined) {
    throw new Error('Mailer was not called');
  }
  return call[1];
};

describe(`POST /users/resetPassword`, () => {
  const requestPath = '/users/resetPassword';
  const newPassword = 'MyEvenStronger!Password456';
  let user: SelectableUser | null = null;
  const resetUser = insertableUserObject.parse({
    email: 'resetPasswordUser@votura.org',
    password: 'MyStrong!Password123',
  });

  beforeEach(async () => {
    // Recreate the user fresh for every test so password/token/session state is
    // fully isolated between tests (the test DB persists across tests in a file).
    const existing = await findUserBy({ email: resetUser.email });
    if (existing !== null) {
      await deleteUser(existing.id);
    }
    await createUser(resetUser);
    user = await findUserBy({ email: resetUser.email });
    if (user === null) {
      throw new Error('Failed to find test user');
    }
    await setUserVerified(user.id);
  });

  it('204: should reset the password with a valid token and allow login with the new password', async () => {
    const rawToken = await requestResetTokenFor(resetUser.email);

    const res = await request(app)
      .post(requestPath)
      .send({ passwordResetToken: rawToken, password: newPassword });
    expect(res.status).toBe(HttpStatusCode.noContent);

    // Login with the new password succeeds.
    const loginRes = await request(app)
      .post('/users/login')
      .send({ email: resetUser.email, password: newPassword });
    expect(loginRes.status).toBe(HttpStatusCode.ok);
    expect(apiTokenUserObject.safeParse(loginRes.body).success).toBe(true);

    // Login with the old password fails.
    const oldLoginRes = await request(app)
      .post('/users/login')
      .send({ email: resetUser.email, password: resetUser.password });
    expect(oldLoginRes.status).toBe(HttpStatusCode.unauthorized);
  });

  it('401: should invalidate existing sessions after a password reset', async () => {
    // Establish a session before the reset.
    const loginRes = await request(app)
      .post('/users/login')
      .send({ email: resetUser.email, password: resetUser.password });
    expect(loginRes.status).toBe(HttpStatusCode.ok);
    const oldRefreshToken = apiTokenUserObject.parse(loginRes.body).refreshToken;

    const rawToken = await requestResetTokenFor(resetUser.email);
    const res = await request(app)
      .post(requestPath)
      .send({ passwordResetToken: rawToken, password: newPassword });
    expect(res.status).toBe(HttpStatusCode.noContent);

    // The refresh token issued before the reset is no longer valid.
    const refreshRes = await request(app)
      .post('/users/refreshTokens')
      .send({ refreshToken: oldRefreshToken });
    expect(refreshRes.status).toBe(HttpStatusCode.unauthorized);
  });

  it('401: should return an error for an unknown token', async () => {
    const res = await request(app)
      .post(requestPath)
      .send({ passwordResetToken: generatePasswordResetToken(), password: newPassword });

    expect(res.status).toBe(HttpStatusCode.unauthorized);
    expect(res.type).toBe('application/json');
    expect(response401Object.safeParse(res.body).success).toBe(true);
  });

  it('401: should return an error for an expired token', async () => {
    if (user === null) {
      throw new Error('Test user not found');
    }
    const rawToken = generatePasswordResetToken();
    await setPasswordResetToken(
      user.id,
      hashPasswordResetToken(rawToken),
      new Date(Date.now() - 1000),
    );

    const res = await request(app)
      .post(requestPath)
      .send({ passwordResetToken: rawToken, password: newPassword });

    expect(res.status).toBe(HttpStatusCode.unauthorized);
    expect(response401Object.safeParse(res.body).success).toBe(true);
  });

  it('400: should return an error for a weak new password', async () => {
    const rawToken = await requestResetTokenFor(resetUser.email);

    const res = await request(app)
      .post(requestPath)
      .send({ passwordResetToken: rawToken, password: 'weak' });

    expect(res.status).toBe(HttpStatusCode.badRequest);
    expect(response400Object.safeParse(res.body).success).toBe(true);
  });

  it('400: should return an error for a missing token', async () => {
    const res = await request(app).post(requestPath).send({ password: newPassword });

    expect(res.status).toBe(HttpStatusCode.badRequest);
    expect(response400Object.safeParse(res.body).success).toBe(true);
  });
});
