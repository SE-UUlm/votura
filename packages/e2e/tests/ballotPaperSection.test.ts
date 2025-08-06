import { expect, test } from '@playwright/test';
import type { UpdateableBallotPaperSection } from '@repo/votura-validators';

const ballotPaperSection: UpdateableBallotPaperSection = {
  name: 'My BPS',
  description: 'My BPS Description',
  maxVotes: 5,
  maxVotesPerCandidate: 2,
};

test.describe('BallotPaperSection', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('user@votura.org');
    await page.getByLabel('Password').fill('HelloVotura1!');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL('/elections');
  });

  test('should create a ballot paper section', async ({ page }) => {
    await page
      .getByRole('row', { name: 'Election 1 This is election' })
      .getByLabel('Settings')
      .nth(1)
      .click();
    await page.getByRole('button', { name: 'Ballot Paper Settings' }).click();
    await page.getByRole('menuitem', { name: 'Add ballot paper section' }).click();
    await page.getByRole('textbox', { name: 'Name' }).fill(ballotPaperSection.name);
    if (ballotPaperSection.description !== undefined) {
      await page.getByRole('textbox', { name: 'Description' }).fill(ballotPaperSection.description);
    }
    await page
      .getByRole('textbox', {
        name: 'Maximum votes',
        exact: true,
      })
      .fill(ballotPaperSection.maxVotes.toString());
    await page
      .getByRole('textbox', { name: 'Maximum votes per candidate' })
      .fill(ballotPaperSection.maxVotesPerCandidate.toString());
    const createButton = page.getByRole('button', { name: 'Create Section' });
    await createButton.click();
    await expect(createButton).not.toBeVisible();
    await expect(page.getByText(ballotPaperSection.name, { exact: true }).first()).toBeVisible();
    if (ballotPaperSection.description !== undefined) {
      await expect(page.getByText(ballotPaperSection.description).first()).toBeVisible();
    }
  });
});
