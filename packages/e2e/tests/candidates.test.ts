import { expect, test } from '@playwright/test';

test.describe('Candidates', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/login');
        await page.getByLabel('Email').fill('user@votura.org');
        await page.getByLabel('Password').fill('HelloVotura1!');
        await page.getByRole('button', { name: 'Login' }).click();
        await expect(page).toHaveURL('/elections');
    });

    test('should create a candidate and link to ballot paper section', async ({page}) => {
        await page.getByRole('button', { name: 'Settings' }).nth(1).click();
        await page.getByRole('button', { name: 'Section Settings' }).click();
        await page.getByRole('menuitem', { name: 'Add candidate' }).click();
        await page.getByRole('textbox', { name: 'Name' }).fill('John Doe');
        await page.getByRole('textbox', { name: 'Description' }).fill('John Doe Description');
        await page.getByRole('button', { name: 'Create Candidate' }).click();
        await expect(page.getByText('Candidates: 1')).toBeVisible();

        await page.getByRole('button', { name: 'Section Settings' }).click();
        await page.getByRole('menuitem', { name: 'Edit candidates' }).click();
        await expect(page.getByRole('heading', { name: 'All Candidates' })).toBeVisible();
        await expect(page.getByText('John Doe', {exact: true})).toBeVisible();
        await expect(page.getByRole('checkbox')).toBeChecked();
    })
})