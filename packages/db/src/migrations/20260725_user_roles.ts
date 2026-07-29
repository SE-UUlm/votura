import type { Kysely } from 'kysely';
import { TableName, UserColumnName } from '../nameEnums.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function createRoleColumn(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable(TableName.user)
    .addColumn(UserColumnName.role, 'varchar', (col) => col.notNull().defaultTo('user'))
    .execute();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function dropRoleColumn(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable(TableName.user).dropColumn(UserColumnName.role).execute();
}

// --- Main Migration Functions ---
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function up(db: Kysely<any>): Promise<void> {
  await createRoleColumn(db);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function down(db: Kysely<any>): Promise<void> {
  await dropRoleColumn(db);
}
