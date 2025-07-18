import { expect, test } from '@playwright/test';

test('should redirect to login when not logged in', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL('/login');
});

test('should reject unknown credentials', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('user@votura.org');
  await page.getByLabel('Password').fill('1234');
  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page.getByText('Could not login')).toBeVisible();
  await expect(page).toHaveURL('/login');
});

test('should reject invalid email format', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('foo');
  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page.getByText('Invalid email address.')).toBeVisible();
});

test('should login', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('user@votura.org');
  await page.getByLabel('Password').fill('HelloVotura1!');
  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page).toHaveURL('/elections');
  const tokens = await page.evaluate(() => {
    return localStorage.getItem('authTokens');
  });

  expect(tokens).not.toBeNull();

  if (tokens === null) {
    throw new Error('No tokens provided');
  }

  const parsedTokens: unknown = JSON.parse(tokens);
  expect(parsedTokens).toHaveProperty('accessToken');
  expect(parsedTokens).toHaveProperty('refreshToken');
});

test('should logout', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('user@votura.org');
  await page.getByLabel('Password').fill('HelloVotura1!');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL('/elections');
  await page.getByRole('button', { name: 'Logout' }).click();
  await expect(page).toHaveURL('/login');
  const tokens = await page.evaluate(() => {
    return localStorage.getItem('authTokens');
  });

  expect(tokens).toBeNull();
});
