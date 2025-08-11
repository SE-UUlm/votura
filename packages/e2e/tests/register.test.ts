import { expect, test } from '@playwright/test';

test.describe('RegisterView logic', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: 'Sign Up' }).click();
    await expect(page).toHaveURL('/register');
  });

  test('BackToLogin button navigates back to LoginView', async ({ page }) => {
    await page.getByRole('button', { name: 'Back To Login' }).click();
    await expect(page).toHaveURL('/login');
  });

  test('RegisterView shows error when email is empty', async ({ page }) => {
    await page.getByRole('button', { name: 'Sign Up' }).click();
    await expect(page.getByText('Invalid email address.')).toBeVisible();
  });

  test('RegisterView shows error when email is invalid', async ({ page }) => {
    await page.getByLabel('Email').fill('not-an-email');
    await page.getByRole('button', { name: 'Sign Up' }).click();
    await expect(page.getByText('Invalid email address.')).toBeVisible();
  });

  test('RegisterView shows error when password is empty', async ({ page }) => {
    await page.getByLabel('Email').fill('user@votura.org');
    await page.getByRole('button', { name: 'Sign Up' }).click();
    await expect(page.getByText('Password does not meet requirements.')).toBeVisible();
  });

  test('RegisterView shows error when password does not meet requirements', async ({ page }) => {
    await page.getByLabel('Email').fill('user@votura.org');
    await page.getByLabel('Password').nth(0).fill('123');
    await page.getByLabel('Password confirmation').fill('123');
    await page.getByRole('button', { name: 'Sign Up' }).click();
    await expect(page.getByText('Password does not meet requirements.')).toBeVisible();
  });

  test('RegisterView shows error when password confirmation does not match', async ({ page }) => {
    await page.getByLabel('Email').fill('user@votura.org');
    await page.getByLabel('Password').nth(0).fill('MySecurePassword1!');
    await page.getByLabel('Password confirmation').fill('MySecurePassword2!');
    await page.getByRole('button', { name: 'Sign Up' }).click();
    await expect(page.getByText('Passwords do not match.')).toBeVisible();
  });

  test('Successful registration with mocked backend', async ({ page }) => {
    await page.route('**/users', async (route) => {
      await route.fulfill({
        status: 204,
        contentType: 'application/json',
        body: '',
      });
    });
    await page.getByLabel('Email').fill('mockuser@votura.org');
    await page.getByLabel('Password').nth(0).fill('MySecurePassword42!');
    await page.getByLabel('Password confirmation').fill('MySecurePassword42!');
    await page.getByRole('button', { name: 'Sign Up' }).click();
    await expect(page.getByText('Almost done!')).toBeVisible();
    await expect(page).toHaveURL('/login');
  });
});
