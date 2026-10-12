import { expect, test } from '@playwright/test';

// Well formed but unknown, so the backend answers 401. No test may complete a
// reset successfully: that would change the password of the seeded user and
// break every other test that logs in.
const unknownToken = 'a'.repeat(64);

test('should open the forgot password view from the login view', async ({ page }) => {
  await page.goto('/login');
  await page.getByRole('button', { name: 'Reset password' }).click();

  await expect(page).toHaveURL('/forgotPassword');
});

test('should confirm the request without revealing whether the account exists', async ({
  page,
}) => {
  await page.goto('/forgotPassword');
  await page.getByLabel('Email').fill('nobody@votura.org');
  await page.getByRole('button', { name: 'Send password reset link' }).click();

  await expect(
    page.getByText(
      'If an account exists for this email address, we have sent a password reset link to it.',
    ),
  ).toBeVisible();
});

test('should ask for a new link when the token is missing', async ({ page }) => {
  await page.goto('/resetPassword');

  await expect(page.getByText('This password reset link is invalid or has expired.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Set new password' })).toBeHidden();
});

test('should reject mismatched passwords', async ({ page }) => {
  await page.goto(`/resetPassword?token=${unknownToken}`);
  // Mantine puts the asterisk of a required field inside the label, so the
  // label reads "New password *". Anchored so it does not match the repetition.
  await page.getByLabel(/^New password/).fill('HelloVotura2!');
  await page.getByLabel('Repeat new password').fill('HelloVotura3!');
  await page.getByRole('button', { name: 'Set new password' }).click();

  await expect(page.getByText('Passwords do not match.')).toBeVisible();
});

test('should reject an expired link', async ({ page }) => {
  await page.goto(`/resetPassword?token=${unknownToken}`);
  await page.getByLabel(/^New password/).fill('HelloVotura2!');
  await page.getByLabel('Repeat new password').fill('HelloVotura2!');
  await page.getByRole('button', { name: 'Set new password' }).click();

  await expect(page.getByText('This password reset link is invalid or has expired.')).toBeVisible();
});
