import { logger } from '@repo/logger';
import nodemailer from 'nodemailer';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { sendPasswordResetEmail } from '../../src/mail/mailer.js';

// Only nodemailer is mocked at the boundary; the real mailer code runs so that
// the transporter setup, sender formatting and error handling are exercised.
const { sendMailMock } = vi.hoisted(() => ({ sendMailMock: vi.fn() }));

vi.mock('nodemailer', () => {
  const createTransport = vi.fn(() => ({ sendMail: sendMailMock }));
  return { default: { createTransport }, createTransport };
});

const mockedCreateTransport = vi.mocked(nodemailer.createTransport);

const ENV_KEYS = [
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_SECURE',
  'SMTP_USER',
  'SMTP_PASS',
  'MAIL_SENDER_NAME',
  'MAIL_SENDER_EMAIL',
  'FRONTEND_BASE_URL',
] as const;

describe('sendPasswordResetEmail', () => {
  const originalEnv: Record<string, string | undefined> = {};

  beforeAll(() => {
    for (const key of ENV_KEYS) {
      originalEnv[key] = process.env[key];
    }
    // Non-default values so the configured transport/sender branches are covered.
    process.env.SMTP_HOST = 'smtp.example.test';
    process.env.SMTP_PORT = '2525';
    process.env.SMTP_SECURE = 'true';
    process.env.SMTP_USER = 'mailer';
    process.env.SMTP_PASS = 'secret';
    process.env.MAIL_SENDER_NAME = 'Votura Test';
    process.env.MAIL_SENDER_EMAIL = 'reset@votura.test';
    process.env.FRONTEND_BASE_URL = 'https://app.votura.test';
  });

  afterAll(() => {
    for (const key of ENV_KEYS) {
      if (originalEnv[key] === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = originalEnv[key];
      }
    }
  });

  beforeEach(() => {
    sendMailMock.mockReset();
  });

  it('sends a reset email with the raw token and link using the configured transport and sender', async () => {
    sendMailMock.mockResolvedValue({ messageId: 'test-message-id' });
    const rawToken = 'a1b2c3d4'.repeat(8); // 64-char hex-like token

    await sendPasswordResetEmail('user@votura.test', rawToken);

    // Transporter is built from the environment.
    expect(mockedCreateTransport).toHaveBeenCalledWith(
      expect.objectContaining({
        host: 'smtp.example.test',
        port: 2525,
        secure: true,
        auth: { user: 'mailer', pass: 'secret' },
      }),
    );

    expect(sendMailMock).toHaveBeenCalledTimes(1);
    const mail = sendMailMock.mock.calls[0]?.[0] as
      | { to?: string; from?: string; subject?: string; text?: string }
      | undefined;
    expect(mail?.to).toBe('user@votura.test');
    expect(mail?.from).toBe('"Votura Test" <reset@votura.test>');
    expect(mail?.subject).toContain('Reset');
    expect(mail?.text).toContain(rawToken);
    expect(mail?.text).toContain(`https://app.votura.test/resetPassword?token=${rawToken}`);
  });

  it('does not throw and logs an error when the transport fails', async () => {
    const sendError = new Error('smtp unavailable');
    sendMailMock.mockRejectedValue(sendError);
    const errorSpy = vi.spyOn(logger, 'error').mockImplementation(() => undefined);

    await expect(sendPasswordResetEmail('user@votura.test', 'f'.repeat(64))).resolves.toBeUndefined();

    expect(errorSpy).toHaveBeenCalledWith(
      expect.objectContaining({ err: sendError }),
      expect.any(String),
    );
    errorSpy.mockRestore();
  });
});
