import { expect, test } from '@playwright/test';

test.describe('Candidates', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('user@votura.org');
    await page.getByLabel('Password').fill('HelloVotura1!');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL('/elections');
  });

  test('should create/link, unlink and delete a candidate', async ({ page }) => {
    const bpsCandidatesOverviewClass = '.bps-active-candidates';
    const bpsAllCandidatesClass = '.bps-all-candidates';

    await page.getByRole('button', { name: 'Settings' }).nth(1).click();
    await page.getByRole('button', { name: 'Section Settings' }).click();
    await page.getByRole('menuitem', { name: 'Add candidate' }).click();
    await page.getByRole('textbox', { name: 'Name' }).fill('John Doe');
    await page.getByRole('textbox', { name: 'Description' }).fill('John Doe Description');
    await page.getByRole('button', { name: 'Create Candidate' }).click();
    await expect(
      page.locator(bpsCandidatesOverviewClass).getByText('John Doe', { exact: true }),
    ).toBeVisible(); // The one in the overview

    await page.getByRole('button', { name: 'Section Settings' }).click();
    await page.getByRole('menuitem', { name: 'Edit candidates' }).click();
    await expect(page.getByRole('heading', { name: 'All Candidates' })).toBeVisible();
    await expect(
      page.locator(bpsAllCandidatesClass).getByText('John Doe', { exact: true }).first(),
    ).toBeVisible(); // The one in the checkbox list
    await expect(page.getByRole('checkbox', { name: 'candidate-checkbox' })).toBeChecked();

    await page.getByRole('checkbox', { name: 'candidate-checkbox' }).click();
    await expect(
      page.locator(bpsCandidatesOverviewClass).getByText('John Doe', { exact: true }),
    ).not.toBeVisible(); // The one in the overview
    await page.getByRole('checkbox', { name: 'candidate-checkbox' }).click();
    await expect(
      page.locator(bpsCandidatesOverviewClass).getByText('John Doe', { exact: true }),
    ).toBeVisible(); // The one in the overview

    await page.getByRole('button', { name: 'Delete candidate' }).click();
    await page.getByRole('button', { name: 'Delete', exact: true }).click();

    await expect(
      page.locator(bpsCandidatesOverviewClass).getByText('John Doe', { exact: true }),
    ).not.toBeVisible(); // The one in the overview
  });
});
