import * as fs from 'node:fs';
import * as Path from 'node:path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { voturaOpenApiSchema } from './voturaOpenApiSchema.js';

/**
 * Persists the Votura OpenAPI schema to a JSON file in the generated directory.
 * @param outputDir - Optional output directory. If not provided, uses the default generated directory.
 * @returns The path where the schema was written.
 */
export function persistSchema(outputDir?: string): string {
  const fileName = fileURLToPath(import.meta.url);
  const directoryName = dirname(fileName);
  const path = outputDir ?? Path.join(directoryName, '/../../generated/');

  if (!fs.existsSync(path)) {
    fs.mkdirSync(path, { recursive: true });
  }

  const schema = JSON.stringify(voturaOpenApiSchema);
  const outputPath = Path.join(path, 'voturaApiSchema.json');
  fs.writeFileSync(outputPath, schema);

  return outputPath;
}

// Only run the function if this script is executed directly (not imported)
if (import.meta.url === `file://${process.argv[1]}`) {
  persistSchema();
}
