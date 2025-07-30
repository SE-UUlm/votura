import { expect, test } from '@playwright/test';
import type { InsertableElection } from '@repo/votura-validators';

const election: InsertableElection = {
  name: 'Test Election',
  private: true,
  allowInvalidVotes: false,
  description: 'My test election',
  votingStartAt: '2025-07-22T13:21:13.087Z',
  votingEndAt: '2025-07-25T13:21:13.087Z',
};

test('should create an election', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('user@votura.org');
  await page.getByLabel('Password').fill('HelloVotura1!');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL('/elections');

  await page.getByRole('button', { name: 'New Election' }).click();
  await page.getByLabel('Name').fill(election.name);
  if (election.description !== undefined) {
    await page.getByLabel('Description').fill(election.description);
  }
  await page.getByRole('button', { name: 'Start of voting period' }).click();
  await page.getByRole('button', { name: '16' }).nth(0).click();
  await page.getByRole('button', { name: 'End of voting period' }).click();
  await page.getByRole('button', { name: '18' }).nth(1).click();
  await page.getByRole('button', { name: 'Create new election' }).click();

  await expect(page).toHaveURL(
    /\/elections\/[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
  );
  await expect(page.getByRole('heading', { name: election.name })).toBeVisible();
  if (election.description !== undefined) {
    await expect(page.getByText(election.description)).toBeVisible();
  }
});
