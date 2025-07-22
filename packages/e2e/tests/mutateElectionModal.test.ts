import { expect, test, type Page } from '@playwright/test';

async function login(page: Page) {
  await page.goto('/login');
  await page.getByLabel('Email').fill('user@votura.org');
  await page.getByLabel('Password').fill('HelloVotura1!');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL('/elections');
}

async function openModal(page: Page) {
  await page.getByRole('button', { name: 'New Election' }).click();
  await expect(page.getByText('Create new election')).toBeVisible();
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
    await expect(page.getByLabel('Allow invalid votes')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Create new election' })).toBeVisible();
  });

  test('EndDateTime picker is disabled initially when no StartDateTime is set', async ({
    page,
  }) => {
    const endDateTimeInput = page.getByLabel('End of voting period');
    await expect(endDateTimeInput).toBeDisabled();
  });

  test('EndDateTime picker becomes enabled after setting StartDateTime', async ({ page }) => {
    const startDateTimeInput = page.getByLabel('Start of voting period');
    const endDateTimeInput = page.getByLabel('End of voting period');
    await startDateTimeInput.fill('2025-10-10T12:00');
    await expect(endDateTimeInput).toBeEnabled();
  });

  test('EndDateTime value is cleared when StartDateTime is moved beyond EndDateTime', async ({
    page,
  }) => {
    const startDateTimeInput = page.getByLabel('Start of voting period');
    const endDateTimeInput = page.getByLabel('End of voting period');
    await startDateTimeInput.fill('2025-10-10T12:00');
    await endDateTimeInput.fill('2025-10-11T12:00');
    await expect(endDateTimeInput).toHaveValue('2025-10-11T12:00');
    await startDateTimeInput.fill('2025-11-10T12:00');
    await expect(endDateTimeInput).toHaveValue('');
  });
});
