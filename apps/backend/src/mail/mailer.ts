import { logger } from '@repo/logger';
import nodemailer, { type Transporter } from 'nodemailer';

let transporter: Transporter | null = null;

/**
 * Lazily creates and caches the nodemailer transporter from the environment.
 * Creating it lazily ensures that importing this module never throws when the
 * mail environment variables are not set (e.g. in unrelated tests).
 *
 * Defaults are tuned for a local Mailpit instance (host localhost, port 1025,
 * no TLS, no auth).
 */
const getTransporter = (): Transporter => {
  if (transporter !== null) {
    return transporter;
  }

  const host = process.env.SMTP_HOST ?? 'localhost';
  const port = parseInt(process.env.SMTP_PORT ?? '1025', 10);
  const secure = process.env.SMTP_SECURE === 'true';

  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: user !== undefined && user !== '' && pass !== undefined ? { user, pass } : undefined,
  });

  return transporter;
};

const getSender = (): string => {
  const name = process.env.MAIL_SENDER_NAME ?? 'Votura';
  const email = process.env.MAIL_SENDER_EMAIL ?? 'no-reply@votura.org';
  return `"${name}" <${email}>`;
};

/**
 * Sends a password reset email containing the raw reset token and a link to the
 * frontend reset page. Errors are logged but not rethrown, so that the caller
 * can keep its response behaviour (e.g. always returning 204) regardless of
 * mail delivery success.
 *
 * @param email The recipient email address.
 * @param rawToken The raw (unhashed) password reset token sent to the user.
 */
export const sendPasswordResetEmail = async (email: string, rawToken: string): Promise<void> => {
  const baseUrl = process.env.FRONTEND_BASE_URL ?? 'http://localhost:5173';
  const resetLink = `${baseUrl}/resetPassword?token=${rawToken}`;

  const subject = 'Reset your votura password';
  const text =
    'You (or someone else) requested a password reset for your votura account.\n\n' +
    `Use the following link to reset your password:\n${resetLink}\n\n` +
    `If the link does not work, use this token in the password reset form:\n${rawToken}\n\n` +
    'This token is valid for one hour. If you did not request a password reset, you can ignore this email.';

  try {
    await getTransporter().sendMail({
      from: getSender(),
      to: email,
      subject,
      text,
    });
    logger.info({ event: 'passwordResetEmailSent' }, 'Password reset email sent');
  } catch (error) {
    logger.error({ err: error }, 'Failed to send password reset email');
  }
};
