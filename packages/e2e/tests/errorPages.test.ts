import { expect, test } from '@playwright/test';

const backToHomePage = 'Back to home page';

test('should show the not found page for an unknown route', async ({ page }) => {
  await page.goto('/does-not-exist');

  await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
  await expect(page).toHaveURL('/does-not-exist');
});

test('should leave the not found page through the button', async ({ page }) => {
  await page.goto('/does-not-exist');
  await page.getByRole('button', { name: backToHomePage }).click();

  await expect(page).toHaveURL('/login');
});

test('should show the error page without details when a route throws', async ({ page }) => {
  // Unparsable tokens make the authenticated routes throw while rendering.
  await page.addInitScript(() => {
    localStorage.setItem('authTokens', '{broken');
  });
  await page.goto('/elections');

  await expect(page.getByRole('heading', { name: 'Something went wrong' })).toBeVisible();
  await expect(page.getByRole('button', { name: backToHomePage })).toBeVisible();
  await expect(page.getByText('SyntaxError')).toBeHidden();
  await expect(page).toHaveURL('/elections');
});
