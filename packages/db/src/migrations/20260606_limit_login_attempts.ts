import { type CreateTableBuilder, type Kysely, sql } from 'kysely';
import { DefaultColumnName, FailedLoginAttemptColumnName, TableName } from '../nameEnums.js';

const timestampDataType = 'timestamptz(6)';

// --- Helper Functions ---
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const addDefaultColumns = (ctb: CreateTableBuilder<any, any>): CreateTableBuilder<any, any> => {
  return ctb
    .addColumn(DefaultColumnName.id, 'uuid', (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn(DefaultColumnName.createdAt, timestampDataType, (col) =>
      col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`),
    )
    .addColumn(DefaultColumnName.modifiedAt, timestampDataType, (col) =>
      col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`),
    )
    .addCheckConstraint('modified_after_created', sql`"modifiedAt" >= "createdAt"`);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function createFailedLoginAttemptTable(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable(TableName.failedLoginAttempt)
    .$call(addDefaultColumns)
    .addColumn(FailedLoginAttemptColumnName.ipAddress, 'bytea', (col) => col.notNull().unique())
    .addColumn(FailedLoginAttemptColumnName.failedAttempts, 'integer', (col) =>
      col.notNull().defaultTo(0),
    )
    .addColumn(FailedLoginAttemptColumnName.blockedUntil, timestampDataType)
    .execute();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function createTables(db: Kysely<any>): Promise<void> {
  await createFailedLoginAttemptTable(db);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function addModifiedAtTriggers(db: Kysely<any>): Promise<void> {
  const tables = [TableName.failedLoginAttempt];

  for (const tableName of tables) {
    await sql`
            CREATE TRIGGER ${sql.raw(tableName)}_modified_at_trigger
            BEFORE UPDATE
            ON ${sql.table(tableName)}
            FOR EACH ROW
            EXECUTE FUNCTION update_modified_at_column();
        `.execute(db);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function dropTables(db: Kysely<any>): Promise<void> {
  // Drop tables in reverse order of creation to handle foreign key dependencies
  await db.schema.dropTable(TableName.failedLoginAttempt).ifExists().execute();
}

// --- Main Migration Functions ---
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function up(db: Kysely<any>): Promise<void> {
  await createTables(db);

  await addModifiedAtTriggers(db);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function down(db: Kysely<any>): Promise<void> {
  // Drop tables (this automatically drops all triggers, constraints, and indexes)
  await dropTables(db);
}
