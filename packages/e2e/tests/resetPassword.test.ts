import { expect, test } from '@playwright/test';

// Well formed but unknown, so the backend answers 401. No test may complete a
// reset successfully: that would change the password of the seeded user and
// break every other test that logs in.
const UNKNOWN_TOKEN = 'a'.repeat(64);
const NEW_PASSWORD = 'HelloVotura2!';
const KNOWN_EMAIL = 'user@votura.org';

const LOGIN_PATH = '/login';
const FORGOT_PASSWORD_PATH = '/forgotPassword';
const RESET_PASSWORD_PATH = '/resetPassword';

const EMAIL_LABEL = 'Email';
const TOKEN_LABEL = 'Password reset token';
// Mantine renders the asterisk of a required field inside the label, so the
// label text is "New password *" and getByLabel compares the label text.
// Anchored at the start so that it does not also match "Repeat new password".
const NEW_PASSWORD_LABEL = /^New password/;
const REPEAT_PASSWORD_LABEL = 'Repeat new password';
const SEND_LINK_BUTTON = 'Send password reset link';
const SET_PASSWORD_BUTTON = 'Set new password';

const CONFIRMATION =
  'If an account exists for this email address, we have sent a password reset link to it.';

test('should open the forgot password view from the login view', async ({ page }) => {
  await page.goto(LOGIN_PATH);
  await page.getByRole('button', { name: 'Reset password' }).click();

  await expect(page).toHaveURL(FORGOT_PASSWORD_PATH);
});

test('should reject an invalid email format', async ({ page }) => {
  await page.goto(FORGOT_PASSWORD_PATH);
  await page.getByLabel(EMAIL_LABEL).fill('foo');
  await page.getByRole('button', { name: SEND_LINK_BUTTON }).click();

  await expect(page.getByText('Invalid email address.')).toBeVisible();
  await expect(page).toHaveURL(FORGOT_PASSWORD_PATH);
});

test('should confirm the request for a known email address', async ({ page }) => {
  await page.goto(FORGOT_PASSWORD_PATH);
  await page.getByLabel(EMAIL_LABEL).fill(KNOWN_EMAIL);
  await page.getByRole('button', { name: SEND_LINK_BUTTON }).click();

  await expect(page.getByText(CONFIRMATION)).toBeVisible();
});

test('should confirm the request for an unknown email address as well', async ({ page }) => {
  await page.goto(FORGOT_PASSWORD_PATH);
  await page.getByLabel(EMAIL_LABEL).fill('nobody@votura.org');
  await page.getByRole('button', { name: SEND_LINK_BUTTON }).click();

  // Same text as for a known address, otherwise the view would tell an attacker
  // which email addresses have an account.
  await expect(page.getByText(CONFIRMATION)).toBeVisible();
});

test('should offer to enter a token after requesting a reset', async ({ page }) => {
  await page.goto(FORGOT_PASSWORD_PATH);
  await page.getByLabel(EMAIL_LABEL).fill(KNOWN_EMAIL);
  await page.getByRole('button', { name: SEND_LINK_BUTTON }).click();
  await page.getByRole('button', { name: 'I already have a token' }).click();

  await expect(page).toHaveURL(RESET_PASSWORD_PATH);
});

test('should prefill the token from the query parameter', async ({ page }) => {
  await page.goto(`${RESET_PASSWORD_PATH}?token=${UNKNOWN_TOKEN}`);

  await expect(page.getByLabel(TOKEN_LABEL)).toHaveValue(UNKNOWN_TOKEN);
});

test('should reject a malformed token', async ({ page }) => {
  await page.goto(RESET_PASSWORD_PATH);
  await page.getByLabel(TOKEN_LABEL).fill('abc');
  await page.getByLabel(NEW_PASSWORD_LABEL).fill(NEW_PASSWORD);
  await page.getByLabel(REPEAT_PASSWORD_LABEL).fill(NEW_PASSWORD);
  await page.getByRole('button', { name: SET_PASSWORD_BUTTON }).click();

  await expect(page.getByText('Invalid password reset token.')).toBeVisible();
  await expect(page).toHaveURL(RESET_PASSWORD_PATH);
});

test('should reject a password that does not meet the requirements', async ({ page }) => {
  await page.goto(`${RESET_PASSWORD_PATH}?token=${UNKNOWN_TOKEN}`);
  await page.getByLabel(NEW_PASSWORD_LABEL).fill('1234');
  await page.getByLabel(REPEAT_PASSWORD_LABEL).fill('1234');
  await page.getByRole('button', { name: SET_PASSWORD_BUTTON }).click();

  await expect(page.getByText('Password does not meet requirements.')).toBeVisible();
});

test('should reject mismatched passwords', async ({ page }) => {
  await page.goto(`${RESET_PASSWORD_PATH}?token=${UNKNOWN_TOKEN}`);
  await page.getByLabel(NEW_PASSWORD_LABEL).fill(NEW_PASSWORD);
  await page.getByLabel(REPEAT_PASSWORD_LABEL).fill('HelloVotura3!');
  await page.getByRole('button', { name: SET_PASSWORD_BUTTON }).click();

  await expect(page.getByText('Passwords do not match.')).toBeVisible();
});

test('should reject an invalid or expired token', async ({ page }) => {
  await page.goto(`${RESET_PASSWORD_PATH}?token=${UNKNOWN_TOKEN}`);
  await page.getByLabel(NEW_PASSWORD_LABEL).fill(NEW_PASSWORD);
  await page.getByLabel(REPEAT_PASSWORD_LABEL).fill(NEW_PASSWORD);
  await page.getByRole('button', { name: SET_PASSWORD_BUTTON }).click();

  await expect(
    page.getByText('The token is invalid or has expired. Please request a new one.').first(),
  ).toBeVisible();
  await expect(page).toHaveURL(new RegExp(RESET_PASSWORD_PATH));
});

test('should lead back to the login view', async ({ page }) => {
  await page.goto(RESET_PASSWORD_PATH);
  await page.getByRole('button', { name: 'Go to login' }).click();

  await expect(page).toHaveURL(LOGIN_PATH);
});
