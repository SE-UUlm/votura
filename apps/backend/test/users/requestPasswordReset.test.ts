import { insertableUserObject, response400Object } from '@repo/votura-validators';
import request from 'supertest';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { app } from '../../src/app.js';
import { hashPasswordResetToken } from '../../src/auth/utils.js';
import { HttpStatusCode } from '../../src/httpStatusCode.js';
import { sendPasswordResetEmail } from '../../src/mail/mailer.js';
import { createUser, findDBUserBy, findUserBy } from '../../src/services/users.service.js';

vi.mock('../../src/mail/mailer.js', () => ({
  sendPasswordResetEmail: vi.fn(),
}));

const mockedSendPasswordResetEmail = vi.mocked(sendPasswordResetEmail);

describe(`POST /users/requestPasswordReset`, () => {
  const requestPath = '/users/requestPasswordReset';
  const resetUser = insertableUserObject.parse({
    email: 'requestResetUser@votura.org',
    password: 'MyStrong!Password123',
    role: 'user',
    active: true,
  });

  beforeAll(async () => {
    await createUser(resetUser);
  });

  it('204: should generate a reset token and send an email for an existing user', async () => {
    mockedSendPasswordResetEmail.mockClear();

    const res = await request(app).post(requestPath).send({ email: resetUser.email });

    expect(res.status).toBe(HttpStatusCode.noContent);
    expect(mockedSendPasswordResetEmail).toHaveBeenCalledTimes(1);

    const call = mockedSendPasswordResetEmail.mock.calls[0];
    if (call === undefined) {
      throw new Error('Mailer was not called');
    }
    const [recipient, rawToken] = call;
    expect(recipient).toBe(resetUser.email);

    // The stored hash must match the hash of the raw token sent in the email.
    const dbUser = await findDBUserBy({ email: resetUser.email });
    expect(dbUser?.passwordResetTokenHash).toBe(hashPasswordResetToken(rawToken));
    expect(dbUser?.passwordResetTokenExpiresAt).not.toBeNull();
  });

  it('204: should not send an email for an unknown email (no user enumeration)', async () => {
    mockedSendPasswordResetEmail.mockClear();

    const res = await request(app).post(requestPath).send({ email: 'doesNotExist@votura.org' });

    expect(res.status).toBe(HttpStatusCode.noContent);
    expect(mockedSendPasswordResetEmail).not.toHaveBeenCalled();

    const dbUser = await findUserBy({ email: 'doesNotExist@votura.org' });
    expect(dbUser).toBeNull();
  });

  it('400: should return an error for an invalid email', async () => {
    const res = await request(app).post(requestPath).send({ email: 'not-an-email' });

    expect(res.status).toBe(HttpStatusCode.badRequest);
    expect(res.type).toBe('application/json');
    const parseResult = response400Object.safeParse(res.body);
    expect(parseResult.success).toBe(true);
  });
});
