import { type CreateTableBuilder, type Kysely, sql } from 'kysely';
import { isPgCronAvailable } from '../migrationUtils.js';
import {
  DefaultColumnName,
  FailedLoginAttemptColumnName,
  FailedLoginAttemptFKName,
  TableName,
} from '../nameEnums.js';

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
    .addColumn(FailedLoginAttemptColumnName.ipAddress, 'bytea', (col) => col.notNull())
    .addColumn(FailedLoginAttemptColumnName.userId, 'uuid')
    .execute();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function addFailedLoginAttemptForeignKeys(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable(TableName.failedLoginAttempt)
    .addForeignKeyConstraint(
      FailedLoginAttemptFKName.userId,
      [FailedLoginAttemptColumnName.userId],
      TableName.user,
      [DefaultColumnName.id],
      (cb) => cb.onDelete('cascade').onUpdate('cascade'),
    )
    .execute();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function createTables(db: Kysely<any>): Promise<void> {
  await createFailedLoginAttemptTable(db);
  await addFailedLoginAttemptForeignKeys(db);
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
export async function createCronjobs(db: Kysely<any>): Promise<void> {
  await sql`
    SELECT cron.schedule(
      'delete_old_failed_login_attempts_cron_job',
      '0 * * * *', -- Run every hour at 0 minutes
      $$DELETE FROM ${sql.table(TableName.failedLoginAttempt)} WHERE ${sql.raw(`"${DefaultColumnName.createdAt}"`)} < NOW() - INTERVAL '7 days'$$
    );
  `.execute(db);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function dropTables(db: Kysely<any>): Promise<void> {
  // Drop tables in reverse order of creation to handle foreign key dependencies
  await db.schema.dropTable(TableName.failedLoginAttempt).ifExists().execute();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function dropCronjobs(db: Kysely<any>): Promise<void> {
  await sql`
    SELECT cron.unschedule('delete_old_failed_login_attempts_cron_job');
  `.execute(db);
}

// --- Main Migration Functions ---
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function up(db: Kysely<any>): Promise<void> {
  await createTables(db);
  await addModifiedAtTriggers(db);

  if (await isPgCronAvailable(db)) {
    await createCronjobs(db);
  } else {
    console.warn('pg_cron is not available, skipping cron job setup (expected on Windows/macOS).');
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function down(db: Kysely<any>): Promise<void> {
  if (await isPgCronAvailable(db)) {
    await dropCronjobs(db);
  }
  await dropTables(db);
}
