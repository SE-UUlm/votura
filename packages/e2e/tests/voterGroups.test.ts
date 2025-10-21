import { expect, test } from '@playwright/test';
import type { InsertableVoterGroup, UpdateableVoterGroup } from '@repo/votura-validators';

const voterGroup: InsertableVoterGroup = {
  name: 'Test Voter Group',
  description: 'My test voter group',
  numberOfVoters: 42,
  ballotPapers: [],
};

const updatedVoterGroup: UpdateableVoterGroup = {
  name: 'Edited Test Voter Group',
  description: 'My updated test voter group',
  numberOfVoters: 123,
  ballotPapers: [],
};

test('should create, update and delete a voter group', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('user@votura.org');
  await page.getByLabel('Password').fill('HelloVotura1!');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL('/elections');

  await page.getByRole('link', { name: 'Voter Groups & Tokens' }).click();
  await expect(page).toHaveURL('/voterGroups');
  await expect(page.getByRole('button', { name: 'New Election' })).toHaveCount(0);

  // create voter group
  const html = await page.content();
  console.warn(html.includes('data-testid="new-voter-group-btn"'));
  await page.waitForSelector('[data-testid="new-voter-group-btn"]', { state: 'attached' });
  const newVoterGroupBtn = page.locator('[data-testid="new-voter-group-btn"]');
  await expect(newVoterGroupBtn).toBeVisible();
  await newVoterGroupBtn.click();
  await page.getByLabel('Voter group name').fill(voterGroup.name);
  if (voterGroup.description !== undefined) {
    await page.getByLabel('Voter group description').fill(voterGroup.description);
  }
  await page.getByLabel('Number of voters').fill(voterGroup.numberOfVoters.toString());
  await page.getByRole('button', { name: 'Create new voter group' }).click();

  // verify creation
  await expect(page.getByRole('heading', { name: voterGroup.name })).toBeVisible();
  if (voterGroup.description !== undefined) {
    await expect(page.getByText(voterGroup.description)).toBeVisible();
  }
  await expect(page.getByText(voterGroup.numberOfVoters.toString())).toBeVisible();

  // update voter group
  await page.getByRole('button', { name: 'Settings' }).click();
  await page.getByRole('menuitem', { name: 'Edit voter group' }).click();
  await page.getByLabel('Voter group name').fill(updatedVoterGroup.name);
  if (updatedVoterGroup.description !== undefined) {
    await page.getByLabel('Voter group description').fill(updatedVoterGroup.description);
  }
  await page.getByLabel('Number of voters').fill(updatedVoterGroup.numberOfVoters.toString());
  await page.getByRole('button', { name: 'Save changes' }).click();

  // verify mutation
  await expect(page.getByRole('heading', { name: updatedVoterGroup.name })).toBeVisible();
  if (updatedVoterGroup.description !== undefined) {
    await expect(page.getByText(updatedVoterGroup.description)).toBeVisible();
  }
  await expect(page.getByText(updatedVoterGroup.numberOfVoters.toString())).toBeVisible();

  // delete voter group
  await page.getByRole('button', { name: 'Settings' }).click();
  await page.getByRole('menuitem', { name: 'Delete voter group' }).click();
  await expect(page.getByRole('dialog', { name: 'Deleting voter group' })).toBeVisible();
  await page.getByRole('button', { name: 'Delete' }).click();

  // verify deletion
  await expect(page).toHaveURL('/voterGroups');
  await expect(page.getByRole('heading', { name: updatedVoterGroup.name })).not.toBeVisible();
});
