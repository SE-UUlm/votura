import type { Kysely } from 'kysely';
import { TableName, UserColumnName } from '../nameEnums.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function createActiveColumn(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable(TableName.user)
    .addColumn(UserColumnName.active, 'boolean', (col) => col.notNull().defaultTo(true))
    .execute();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function dropActiveColumn(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable(TableName.user).dropColumn(UserColumnName.active).execute();
}

// --- Main Migration Functions ---
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function up(db: Kysely<any>): Promise<void> {
  await createActiveColumn(db);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function down(db: Kysely<any>): Promise<void> {
  await dropActiveColumn(db);
}
