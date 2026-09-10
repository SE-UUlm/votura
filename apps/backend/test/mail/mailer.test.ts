import { logger } from '@repo/logger';
import nodemailer from 'nodemailer';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { sendPasswordResetEmail } from '../../src/mail/mailer.js';

// Only nodemailer is mocked at the boundary; the real mailer code runs so that
// the transporter setup, sender formatting and error handling are exercised.
const { sendMailMock } = vi.hoisted(() => ({ sendMailMock: vi.fn() }));

vi.mock('nodemailer', () => {
  const createTransport = vi.fn(() => ({ sendMail: sendMailMock }));
  return { default: { createTransport }, createTransport };
});

const mockedCreateTransport = vi.mocked(nodemailer.createTransport);

const recipient = 'reset.recipient@votura.test';
const rawToken = 'raw-password-reset-token';

interface CapturedMail {
  to?: string;
  from?: string;
  subject?: string;
  text?: string;
}

describe('sendPasswordResetEmail', () => {
  beforeEach(() => {
    sendMailMock.mockReset();
  });

  it('sends a reset email containing the raw token and reset link', async () => {
    sendMailMock.mockResolvedValue({ messageId: 'test-message-id' });

    await sendPasswordResetEmail(recipient, rawToken);

    expect(mockedCreateTransport).toHaveBeenCalled();
    expect(sendMailMock).toHaveBeenCalledTimes(1);

    const mail = sendMailMock.mock.calls[0]?.[0] as CapturedMail | undefined;
    expect(mail?.to).toBe(recipient);
    expect(mail?.from).toContain('Votura');
    expect(mail?.subject).toContain('Reset');
    expect(mail?.text).toContain(rawToken);
    expect(mail?.text).toContain(`/resetPassword?token=${rawToken}`);
  });

  it('does not throw and logs an error when the transport fails', async () => {
    const sendError = new Error('transport unavailable');
    sendMailMock.mockRejectedValue(sendError);
    const errorSpy = vi.spyOn(logger, 'error').mockImplementation(() => undefined);

    await expect(sendPasswordResetEmail(recipient, rawToken)).resolves.toBeUndefined();

    expect(errorSpy).toHaveBeenCalledWith(
      expect.objectContaining({ err: sendError }),
      expect.any(String),
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });
});
