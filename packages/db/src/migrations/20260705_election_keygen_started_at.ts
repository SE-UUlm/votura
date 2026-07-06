import type { Kysely } from 'kysely';
import { ElectionColumnName, TableName } from '../nameEnums.js';

const timestampDataType = 'timestamptz(6)';

// --- Main Migration Functions ---
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function up(db: Kysely<any>): Promise<void> {
  // Nullable, no default and no backfill on purpose:
  // For elections that are already stuck in a frozen state without keys
  // (key generation crashed before this column existed) the value stays NULL,
  // so they are immediately considered "not generating keys" and can be unfrozen.
  await db.schema
    .alterTable(TableName.election)
    .addColumn(ElectionColumnName.keyGenStartedAt, timestampDataType)
    .execute();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function down(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable(TableName.election)
    .dropColumn(ElectionColumnName.keyGenStartedAt)
    .execute();
}
