import { expect, test } from '@playwright/test';
import type { UpdateableBallotPaperSection } from '@repo/votura-validators';

const bpSection: UpdateableBallotPaperSection = {
  name: 'My BPS',
  description: 'My BPS Description',
  maxVotes: 5,
  maxVotesPerCandidate: 2,
};

test.describe('Candidates', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('user@votura.org');
    await page.getByLabel('Password').fill('HelloVotura1!');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL('/elections');
  });

  test('should create/link, unlink and delete a candidate', async ({ page }) => {
    await page
      .getByRole('row', { name: 'Election 1 This is election' })
      .getByLabel('Details')
      .first()
      .click();

    if ((await page.getByText('Create a section to get started.').count()) > 0) {
      await page.getByRole('menuitem', { name: 'Add ballot paper section' }).click();
      await page.getByRole('textbox', { name: 'Name' }).fill(bpSection.name);
      if (bpSection.description !== undefined) {
        await page.getByRole('textbox', { name: 'Description' }).fill(bpSection.description);
      }
      await page
        .getByRole('textbox', {
          name: 'Maximum votes',
          exact: true,
        })
        .fill(bpSection.maxVotes.toString());
      await page
        .getByRole('textbox', { name: 'Maximum votes per candidate' })
        .fill(bpSection.maxVotesPerCandidate.toString());
      const createButton = page.getByRole('button', { name: 'Create Section' });
      await createButton.click();
      await expect(createButton).not.toBeVisible();
      await expect(page.getByText(bpSection.name, { exact: true }).first()).toBeVisible();
      if (bpSection.description !== undefined) {
        await expect(page.getByText(bpSection.description).first()).toBeVisible();
      }
    }

    await page.getByRole('button', { name: 'Section Settings' }).last().click();
    await page.getByRole('menuitem', { name: 'Add candidate' }).click();
    await page.getByRole('textbox', { name: 'Name' }).fill('John Doe');
    await page.getByRole('textbox', { name: 'Description' }).fill('John Doe Description');
    await page.getByRole('button', { name: 'Create Candidate' }).click();
    await expect(page.getByText('Candidates: 1')).toBeVisible();

    await page.getByRole('button', { name: 'Section Settings' }).last().click();
    await page.getByRole('menuitem', { name: 'Edit candidates' }).click();
    await expect(page.getByRole('heading', { name: 'All Candidates' })).toBeVisible();
    await expect(page.getByText('John Doe', { exact: true }).first()).toBeVisible();
    await expect(page.getByRole('checkbox', { name: 'candidate-checkbox' })).toBeChecked();

    await page.getByRole('checkbox', { name: 'candidate-checkbox' }).click();
    await expect(page.getByText('Candidates: 0')).toBeVisible();
    await page.getByRole('checkbox', { name: 'candidate-checkbox' }).click();
    await expect(page.getByText('Candidates: 1')).toBeVisible();

    await page.getByRole('button', { name: 'Delete candidate' }).click();
    await page.getByRole('button', { name: 'Delete', exact: true }).click();

    await expect(page.getByText('Candidates: 0')).toBeVisible();
  });
});
