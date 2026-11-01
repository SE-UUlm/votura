import { expect, test, type Page } from '@playwright/test';

// The redirect of / only checks whether tokens are stored, so they do not have to be valid.
// The voting pages do not bounce on an invalid voter token, they just show no elections.
const fakeVoterToken = { voterToken: 'fake-voter-token' };
const fakeAuthTokens = {
  authTokens: JSON.stringify({ accessToken: 'fake-access', refreshToken: 'fake-refresh' }),
};

const storeTokens = async (page: Page, items: Record<string, string>): Promise<void> => {
  await page.addInitScript((entries) => {
    for (const [key, value] of Object.entries(entries)) {
      localStorage.setItem(key, value);
    }
  }, items);
};

test.describe('Root redirect', () => {
  test('should redirect a voter to the voting home page', async ({ page }) => {
    await storeTokens(page, fakeVoterToken);
    await page.goto('/');
    await expect(page).toHaveURL('/votingHome');
  });

  test('should prefer the voter session if user tokens are stored as well', async ({ page }) => {
    await storeTokens(page, { ...fakeVoterToken, ...fakeAuthTokens });
    await page.goto('/');
    await expect(page).toHaveURL('/votingHome');
  });

  // Fake user tokens would be rejected by the backend on /elections and end up on /login,
  // so this case uses a real login of the seed user.
  test('should redirect a logged in user to the elections page', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('user@votura.org');
    await page.getByRole('textbox', { name: 'Password' }).fill('HelloVotura1!');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL('/elections');

    await page.goto('/');
    await expect(page).toHaveURL('/elections');
  });
});
