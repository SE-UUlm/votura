import { expect, test } from '@playwright/test';

// Well formed but unknown, so the backend answers 401. No test may complete a
// reset successfully: that would change the password of the seeded user and
// break every other test that logs in.
const UNKNOWN_TOKEN = 'a'.repeat(64);
const NEW_PASSWORD = 'HelloVotura2!';

const CONFIRMATION =
  'If an account exists for this email address, we have sent a password reset link to it.';

test('should open the forgot password view from the login view', async ({ page }) => {
  await page.goto('/login');
  await page.getByRole('button', { name: 'Reset password' }).click();

  await expect(page).toHaveURL('/forgotPassword');
});

test('should reject an invalid email format', async ({ page }) => {
  await page.goto('/forgotPassword');
  await page.getByLabel('Email').fill('foo');
  await page.getByRole('button', { name: 'Send password reset link' }).click();

  await expect(page.getByText('Invalid email address.')).toBeVisible();
  await expect(page).toHaveURL('/forgotPassword');
});

test('should confirm the request for a known email address', async ({ page }) => {
  await page.goto('/forgotPassword');
  await page.getByLabel('Email').fill('user@votura.org');
  await page.getByRole('button', { name: 'Send password reset link' }).click();

  await expect(page.getByText(CONFIRMATION)).toBeVisible();
});

test('should confirm the request for an unknown email address as well', async ({ page }) => {
  await page.goto('/forgotPassword');
  await page.getByLabel('Email').fill('nobody@votura.org');
  await page.getByRole('button', { name: 'Send password reset link' }).click();

  // Same text as for a known address, otherwise the view would tell an attacker
  // which email addresses have an account.
  await expect(page.getByText(CONFIRMATION)).toBeVisible();
});

test('should offer to enter a token after requesting a reset', async ({ page }) => {
  await page.goto('/forgotPassword');
  await page.getByLabel('Email').fill('user@votura.org');
  await page.getByRole('button', { name: 'Send password reset link' }).click();
  await page.getByRole('button', { name: 'I already have a token' }).click();

  await expect(page).toHaveURL('/resetPassword');
});

test('should prefill the token from the query parameter', async ({ page }) => {
  await page.goto(`/resetPassword?token=${UNKNOWN_TOKEN}`);

  await expect(page.getByLabel('Password reset token')).toHaveValue(UNKNOWN_TOKEN);
});

test('should reject a malformed token', async ({ page }) => {
  await page.goto('/resetPassword');
  await page.getByLabel('Password reset token').fill('abc');
  await page.getByLabel('New password', { exact: true }).fill(NEW_PASSWORD);
  await page.getByLabel('Repeat new password').fill(NEW_PASSWORD);
  await page.getByRole('button', { name: 'Set new password' }).click();

  await expect(page.getByText('Invalid password reset token.')).toBeVisible();
  await expect(page).toHaveURL('/resetPassword');
});

test('should reject a password that does not meet the requirements', async ({ page }) => {
  await page.goto(`/resetPassword?token=${UNKNOWN_TOKEN}`);
  await page.getByLabel('New password', { exact: true }).fill('1234');
  await page.getByLabel('Repeat new password').fill('1234');
  await page.getByRole('button', { name: 'Set new password' }).click();

  await expect(page.getByText('Password does not meet requirements.')).toBeVisible();
});

test('should reject mismatched passwords', async ({ page }) => {
  await page.goto(`/resetPassword?token=${UNKNOWN_TOKEN}`);
  await page.getByLabel('New password', { exact: true }).fill(NEW_PASSWORD);
  await page.getByLabel('Repeat new password').fill('HelloVotura3!');
  await page.getByRole('button', { name: 'Set new password' }).click();

  await expect(page.getByText('Passwords do not match.')).toBeVisible();
});

test('should reject an invalid or expired token', async ({ page }) => {
  await page.goto(`/resetPassword?token=${UNKNOWN_TOKEN}`);
  await page.getByLabel('New password', { exact: true }).fill(NEW_PASSWORD);
  await page.getByLabel('Repeat new password').fill(NEW_PASSWORD);
  await page.getByRole('button', { name: 'Set new password' }).click();

  await expect(
    page.getByText('The token is invalid or has expired. Please request a new one.').first(),
  ).toBeVisible();
  await expect(page).toHaveURL(/\/resetPassword/);
});

test('should lead back to the login view', async ({ page }) => {
  await page.goto('/resetPassword');
  await page.getByRole('button', { name: 'Go to login' }).click();

  await expect(page).toHaveURL('/login');
});
