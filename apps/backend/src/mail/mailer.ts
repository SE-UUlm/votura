import { logger } from '@repo/logger';
import nodemailer, { type Transporter } from 'nodemailer';

let transporter: Transporter | null = null;

/**
 * Creates and caches the nodemailer transporter from the environment variables.
 * Defaults are tuned for the local docker-compose Mailpit instance
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
 * Sends an account creation email containing a link to set the initial password to a newly created user.
 * @param email The recipient's email address
 * @param userId The user's UUID
 * @param password The user's current password which has to be present in the link
 */
export const sendAccountCreationEmail = async (email: string, userId: string, password: string): Promise<void> => {
  const setInitialPasswordLink = `${process.env.FRONTEND_BASE_URL ?? 'http://localhost:5173'}/set-password?userId=${encodeURIComponent(userId)}&otp=${encodeURIComponent(password)}`;
  const subject = 'Your votura account';
  const text =
    'A new votura account was created with this email address.\n\n' +
    `To verify your email address and to set an initial password, please open the following link: ${setInitialPasswordLink}\n\n` +
    'If you did not request this account, you can ignore this email.';

  try {
    await getTransporter().sendMail({
      from: getSender(),
      to: email,
      subject,
      text,
    });

    logger.info({ event: 'sendAccountCreationEmail' }, 'Account creation mail sent');
  } catch (e) {
    logger.error({ e }, 'Failed to send account creation mail');
  }
};
