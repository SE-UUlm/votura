import { expect, test } from '@playwright/test';
import type { InsertableBallotPaper } from '@repo/votura-validators';

const ballotPaper: InsertableBallotPaper = {
  name: 'Student Ballot Paper',
  description: 'Student Ballot Paper Description',
  maxVotes: 5,
  maxVotesPerCandidate: 2,
};

test.describe('Ballot Paper', () => {

  test.beforeEach(async ({page}) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('user@votura.org');
    await page.getByLabel('Password').fill('HelloVotura1!');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL('/elections');
  })

  test('should create a ballot paper', async ({ page }) => {
    await page
        .getByRole('row', { name: 'Election 1 This is election' })
        .getByLabel('Settings')
        .nth(1)
        .click();
    await page.getByRole('button', { name: 'New Ballot Paper' }).click();
    const nameTextbox = page.getByRole('textbox', { name: 'Name' });
    await nameTextbox.fill(ballotPaper.name);
    if (ballotPaper.description !== undefined) {
      await page.getByRole('textbox', { name: 'Description' }).fill(ballotPaper.description);
    }
    await page
        .getByRole('textbox', { name: 'Maximum votes', exact: true })
        .fill(ballotPaper.maxVotes.toString());
    await page
        .getByRole('textbox', { name: 'Maximum votes per candidate' })
        .fill(ballotPaper.maxVotesPerCandidate.toString());
    await page.getByRole('button', { name: 'Create new ballot paper' }).click();
    await expect(nameTextbox).not.toBeAttached();
    await expect(page.getByText(ballotPaper.name, { exact: true }).first()).toBeVisible();
    if (ballotPaper.description !== undefined) {
      await expect(page.getByText(ballotPaper.description, { exact: true }).first()).toBeVisible();
    }
  });

  test('should update a ballot paper', async ({page}) => {
    await page.getByRole('row', { name: 'Election 1 This is election' }).getByLabel('Settings').nth(1).click();
    await page.getByRole('button', { name: 'Settings' }).nth(1).click();
    await page.getByRole('menuitem', { name: 'Edit' }).click();
    await page.getByRole('textbox', { name: 'Description' }).fill('This is ballot paper two');
    await page.getByRole('button', { name: 'Save changes' }).click();
    await expect(page.getByText('This is ballot paper two')).toBeVisible();
  })

  test('should delete a ballot paper', async ({page}) => {
    await page.getByRole('row', { name: 'Election 1 This is election' }).getByLabel('Settings').nth(1).click();
    await page.getByRole('button', { name: 'Settings' }).nth(1).click();
    await page.getByRole('menuitem', { name: 'Delete' }).click();
    await page.getByRole('button', { name: 'Delete' }).click();
    await page.waitForTimeout(1000)
    await expect(page.getByText('Ballot Paper 1', { exact: true })).not.toBeVisible();
  })
})


