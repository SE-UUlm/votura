import { expect, test } from '@playwright/test';

const overviewClass = '.bps-active-candidates';
const allClass = '.bps-all-candidates';
const checkboxName = 'candidate-checkbox';

test.describe('Candidates', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('user@votura.org');
    await page.getByLabel('Password').fill('HelloVotura1!');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL('/elections');
  });

  test('should create/link, unlink and delete a candidate', async ({ page }) => {
    await page.getByRole('button', { name: 'Settings' }).nth(1).click();
    await page.getByRole('button', { name: 'Section Settings' }).click();
    await page.getByRole('menuitem', { name: 'Add candidate' }).click();
    await page.getByRole('textbox', { name: 'Name' }).fill('John Doe');
    await page.getByRole('textbox', { name: 'Description' }).fill('John Doe Description');
    await page.getByRole('button', { name: 'Create Candidate' }).click();

    const overview = page.locator(overviewClass).getByText('John Doe', { exact: true });
    const all = page.locator(allClass).getByText('John Doe', { exact: true }).first();
    await expect(overview).toBeVisible(); // The one in the overview

    await page.getByRole('button', { name: 'Section Settings' }).click();
    await page.getByRole('menuitem', { name: 'Edit candidates' }).click();
    await expect(page.getByRole('heading', { name: 'All Candidates' })).toBeVisible();
    await expect(all).toBeVisible(); // The one in the checkbox list of all candidates
    await expect(page.getByRole('checkbox', { name: checkboxName })).toBeChecked();

    await page.getByRole('checkbox', { name: checkboxName }).click();
    await expect(overview).not.toBeVisible();
    await page.getByRole('checkbox', { name: checkboxName }).click();
    await expect(overview).toBeVisible();

    await page.getByRole('button', { name: 'Delete candidate' }).click();
    await page.getByRole('button', { name: 'Delete', exact: true }).click();

    await expect(overview).not.toBeVisible(); // The one in the overview
  });
});
