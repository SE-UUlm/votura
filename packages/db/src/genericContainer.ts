import path from 'path';
import { GenericContainer, Wait } from 'testcontainers';
import { fileURLToPath } from 'url';

const FILENAME = fileURLToPath(import.meta.url);
const DIRNAME = path.dirname(FILENAME);

const image = await GenericContainer.fromDockerfile(
  path.join(DIRNAME, '../'),
  'dockerfile',
).build();

/**
 * Waits until postgres actually accepts connections.
 *
 * Without this, `start()` resolves as soon as the container runs and the port is
 * bound, while postgres is still starting up and answers with `57P03`. The
 * official image logs the ready message twice on a fresh volume, once for the
 * temporary server that runs the init scripts and once for the real one, so
 * waiting for the first occurrence would still be too early.
 */
export const genericContainer = image.withWaitStrategy(
  Wait.forLogMessage(/database system is ready to accept connections/, 2),
);
