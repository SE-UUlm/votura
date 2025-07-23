import { expect, test, type Page } from '@playwright/test';

async function login(page: Page): Promise<void> {
  await page.goto('/login');
  await page.getByLabel('Email').fill('user@votura.org');
  await page.getByLabel('Password').fill('HelloVotura1!');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL('/elections');
}

async function openModal(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'New Election' }).click();
  await expect(page.getByText('Create new election')).toBeVisible();
}

async function pickDateTime(page: Page, gridcell: string): Promise<void> {
  await page.getByRole('button', { name: gridcell }).click();
  await page.getByRole('spinbutton', { name: 'hour' }).fill('12');
  await page.getByRole('spinbutton', { name: 'minute' }).fill('00');
}

test.describe('MutateElectionModal logic', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await openModal(page);
  });

  test('MutateElectionModal shows all required fields', async ({ page }) => {
    await expect(page.getByLabel('Name')).toBeVisible();
    await expect(page.getByLabel('Description')).toBeVisible();
    await expect(page.getByLabel('Start of voting period')).toBeVisible();
    await expect(page.getByLabel('End of voting period')).toBeVisible();
    await expect(page.getByText('Allow invalid votes')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Create new election' })).toBeVisible();
  });

  test('EndDateTime picker is disabled initially when no StartDateTime is set', async ({
    page,
  }) => {
    await expect(page.getByLabel('End of voting period')).toBeDisabled();
  });

  test('EndDateTime picker becomes enabled after setting StartDateTime', async ({ page }) => {
    await page.getByLabel('Start of voting period').click();
    await pickDateTime(page, '10');
    await expect(page.getByLabel('End of voting period')).toBeEnabled();
  });

  test('EndDateTime value is cleared when StartDateTime is moved beyond EndDateTime', async ({
    page,
  }) => {
    await page.getByLabel('Start of voting period').click();
    await pickDateTime(page, '10');
    await page.getByLabel('End of voting period').click();
    await pickDateTime(page, '11');
    await expect(page.getByLabel('End of voting period')).not.toHaveValue('');

    await page.getByLabel('Start of voting period').click();
    await page.getByRole('button', { name: 'Next month' }).click();
    await pickDateTime(page, '10');
    await expect(page.getByLabel('End of voting period')).toHaveValue('');
  });
});
