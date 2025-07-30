import fs from 'fs';
import path from 'path';
import { beforeEach, describe, expect, it } from 'vitest';
import { persistSchema } from '../../src/schema/persistSchema.js';

describe('OpenAPI definition.', () => {
  const testOutputDir = path.join(process.cwd(), 'generated/test-tmp');

  beforeEach(async () => {
    if (fs.existsSync(testOutputDir)) {
      await fs.promises.rm(testOutputDir, { recursive: true, force: true });
    }
  });
  it('should build votura OpenAPI via function call.', async () => {
    const jsonFilePath = persistSchema(testOutputDir);
    await fs.promises.access(jsonFilePath);
  });
  it('should write valid JSON content', () => {
    const outputPath = persistSchema(testOutputDir);
    const content = fs.readFileSync(outputPath, 'utf-8');

    expect(() => JSON.parse(content) as unknown).not.toThrow();
  });
});
