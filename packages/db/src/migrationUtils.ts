import { type Kysely, sql } from 'kysely';

/**
 * Checks whether the `pg_cron` extension is available on the connected
 * PostgreSQL server. `pg_cron` is Linux-only, so migrations use this to skip
 * cron setup on platforms where it is not installed (e.g. Windows/macOS during
 * local development).
 *
 * Extracted into a shared utility so future migrations can reuse it instead of
 * redefining the same availability check.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function isPgCronAvailable(db: Kysely<any>): Promise<boolean> {
  const result = await sql<{ name: string }>`
    SELECT name FROM pg_available_extensions WHERE name = 'pg_cron'
  `.execute(db);
  return result.rows.length > 0;
}
