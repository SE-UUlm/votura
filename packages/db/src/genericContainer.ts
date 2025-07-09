import path from 'path';
import { GenericContainer } from 'testcontainers';
import { fileURLToPath } from 'url';

const FILENAME = fileURLToPath(import.meta.url);
const DIRNAME = path.dirname(FILENAME);

export const genericContainer = await GenericContainer.fromDockerfile(
  path.join(DIRNAME, '../'),
  'dockerfile',
).build();
