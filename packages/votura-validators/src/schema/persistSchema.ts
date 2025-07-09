import * as fs from 'node:fs';
import * as Path from 'node:path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { voturaOpenApiSchema } from './voturaOpenApiSchema.js';

const fileName = fileURLToPath(import.meta.url);
const directoryName = dirname(fileName);
const path = Path.join(directoryName, '/../../generated/');

if (!fs.existsSync(path)) {
  fs.mkdirSync(path);
}

const schema = JSON.stringify(voturaOpenApiSchema);
fs.writeFileSync(Path.join(path, 'voturaApiSchema.json'), schema);
