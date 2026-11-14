import type { Kysely } from 'kysely';
import { ElectionColumnName, TableName } from '../nameEnums.js';

const timestampDataType = 'timestamptz(6)';

// --- Main Migration Functions ---
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function up(db: Kysely<any>): Promise<void> {
  // Both columns stay NULL until the results of the election are published.
  await db.schema
    .alterTable(TableName.election)
    .addColumn(ElectionColumnName.resultsPublishedAt, timestampDataType)
    .addColumn(ElectionColumnName.results, 'jsonb')
    .execute();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function down(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable(TableName.election)
    .dropColumn(ElectionColumnName.resultsPublishedAt)
    .dropColumn(ElectionColumnName.results)
    .execute();
}
