import type { Kysely } from 'kysely';
import { ElectionColumnName, TableName } from '../nameEnums.js';

// --- Main Migration Functions ---
/* eslint-disable @typescript-eslint/no-explicit-any */
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable(TableName.election)
    .addColumn(ElectionColumnName.allowRevote, 'boolean', (col) => col.notNull().defaultTo(false))
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable(TableName.election)
    .dropColumn(ElectionColumnName.allowRevote)
    .execute();
}
