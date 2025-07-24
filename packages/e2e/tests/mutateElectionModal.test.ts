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
    await page.getByRole('button', { name: '10' }).click();
    await expect(page.getByLabel('End of voting period')).toBeEnabled();
  });

  test('EndDateTime value is cleared when StartDateTime is moved beyond EndDateTime', async ({
    page,
  }) => {
    const startPicker = page.getByLabel('Start of voting period');
    const startPickerID = await startPicker.getAttribute('aria-controls');
    const endPicker = page.getByLabel('End of voting period');
    const endPickerID = await endPicker.getAttribute('aria-controls');

    await startPicker.click();
    await page.locator(`#${startPickerID}`).getByRole('button', { name: '10' }).click();
    await endPicker.click();
    await page.locator(`#${endPickerID}`).getByRole('button', { name: '11' }).click();
    await expect(endPicker).not.toHaveText('');

    await startPicker.click();
    await page.locator(`#${startPickerID}`).getByRole('button', { name: 'Next month' }).click();
    await page.locator(`#${startPickerID}`).getByRole('button', { name: '10' }).click();
    await expect(endPicker).toHaveText('');
  });
});
