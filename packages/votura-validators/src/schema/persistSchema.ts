import * as fs from 'node:fs';
import * as Path from 'node:path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { voturaOpenApiSchema } from './voturaOpenApiSchema.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const path = Path.join(__dirname, '/../../generated/');

if (!fs.existsSync(path)) {
  fs.mkdirSync(path);
}

const schema = JSON.stringify(voturaOpenApiSchema);
fs.writeFileSync(Path.join(path, 'voturaApiSchema.json'), schema);
