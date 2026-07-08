import { test as base, expect } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'path';

const FILENAME = fileURLToPath(import.meta.url);
const DIRNAME = path.dirname(FILENAME);
const nycOutputDir = path.join(DIRNAME, '../../../apps/frontend/.nyc_output');

const test = base.extend({});

test.afterEach(async ({ page }, testInfo) => {
  if (page.isClosed()) {
    return;
  }

  const coverage = await page.evaluate(() => {
    const coverageCarrier = globalThis as Record<string, unknown>;
    // eslint-disable-next-line @typescript-eslint/dot-notation
    const coverageObject = coverageCarrier['__coverage__'];
    return coverageObject ?? null;
  });

  if (coverage === null) {
    return;
  }

  const fileName = `${testInfo.testId.replaceAll(/[^A-Za-z0-9_-]/g, '_')}-${testInfo.retry}.json`;
  await mkdir(nycOutputDir, { recursive: true });
  await writeFile(path.join(nycOutputDir, fileName), JSON.stringify(coverage));
});

export type { Page } from '@playwright/test';
export { expect, test };
