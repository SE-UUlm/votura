import { type CreateTableBuilder, type Kysely, sql } from 'kysely';
import {
  AccessTokenBlacklistColumnName,
  BallotPaperColumnName,
  BallotPaperFKName,
  BallotPaperSectionCandidateColumnName,
  BallotPaperSectionCandidateFKName,
  BallotPaperSectionColumnName,
  BallotPaperSectionFKName,
  CandidateColumnName,
  CandidateFKName,
  DefaultColumnName,
  ElectionColumnName,
  ElectionFKName,
  RegexPattern,
  TableName,
  UserColumnName,
  VoterColumnName,
  VoterFKName,
  VoterGroupColumnName,
  VoterRegisterColumnName,
  VoterRegisterFKName,
} from '../nameEnums.js';

// --- Helper Functions ---
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const addDefaultColumns = (ctb: CreateTableBuilder<any, any>): CreateTableBuilder<any, any> => {
  return ctb
    .addColumn(DefaultColumnName.id, 'uuid', (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid
            ()`),
    )
    .addColumn(DefaultColumnName.createdAt, 'timestamptz(6)', (col) =>
      col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`),
    )
    .addColumn(DefaultColumnName.modifiedAt, 'timestamptz(6)', (col) =>
      col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`),
    )
    .addCheckConstraint(
      'modified_after_created',
      sql`"modifiedAt"
        >= "createdAt"`,
    );
};

// --- Table Creation Helper Functions ---
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function createUserTable(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable(TableName.user)
    .$call(addDefaultColumns)
    .addColumn(UserColumnName.email, 'varchar(256)', (col) => col.notNull().unique())
    .addColumn(UserColumnName.passwordHash, 'varchar(256)', (col) => col.notNull())
    .addColumn(UserColumnName.verified, 'boolean', (col) => col.notNull().defaultTo(false))
    .addColumn(UserColumnName.emailVerificationTokenHash, 'varchar(64)')
    .addColumn(UserColumnName.emailVerificationTokenExpiresAt, 'timestamptz(6)')
    .addColumn(UserColumnName.passwordResetTokenHash, 'varchar(64)')
    .addColumn(UserColumnName.passwordResetTokenExpiresAt, 'timestamptz(6)')
    .addColumn(UserColumnName.refreshTokenHash, 'varchar(64)')
    .addColumn(UserColumnName.refreshTokenExpiresAt, 'timestamptz(6)')
    .addCheckConstraint(
      'valid_email',
      sql`"email"
        ~
        ${sql.lit(RegexPattern.email)}`,
    )
    .execute();

  // Add a trigger to update modifiedAt on row updates
  await sql`
        CREATE TRIGGER ${sql.raw(TableName.user)}_modified_at_trigger
            BEFORE UPDATE
            ON ${sql.table(TableName.user)}
            FOR EACH ROW
            EXECUTE FUNCTION update_modified_at_column();
    `.execute(db);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function createAccessTokenBlacklistTable(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable(TableName.accessTokenBlacklist)
    .$call(addDefaultColumns)
    .addColumn(AccessTokenBlacklistColumnName.accessTokenId, 'uuid', (col) =>
      col.notNull().unique(),
    )
    .addColumn(AccessTokenBlacklistColumnName.expiresAt, 'timestamptz(6)', (col) => col.notNull())
    .execute();

  // Add a trigger to update modifiedAt on row updates
  await sql`
        CREATE TRIGGER ${sql.raw(TableName.accessTokenBlacklist)}_modified_at_trigger
            BEFORE UPDATE
            ON ${sql.table(TableName.accessTokenBlacklist)}
            FOR EACH ROW
            EXECUTE FUNCTION update_modified_at_column();
    `.execute(db);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function createElectionTable(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable(TableName.election)
    .$call(addDefaultColumns)
    .addColumn(ElectionColumnName.name, 'varchar(256)', (col) => col.notNull())
    .addColumn(ElectionColumnName.description, 'varchar(256)')
    .addColumn(ElectionColumnName.votingStartAt, 'timestamptz(6)', (col) => col.notNull())
    .addColumn(ElectionColumnName.votingEndAt, 'timestamptz(6)', (col) => col.notNull())
    .addColumn(ElectionColumnName.configFrozen, 'boolean', (col) => col.notNull().defaultTo(false))
    .addColumn(ElectionColumnName.allowInvalidVotes, 'boolean', (col) =>
      col.notNull().defaultTo(false),
    )
    .addColumn(ElectionColumnName.private, 'boolean', (col) => col.notNull().defaultTo(true))
    .addColumn(ElectionColumnName.pubKey, sql`numeric`)
    .addColumn(ElectionColumnName.privKey, sql`numeric`)
    .addColumn(ElectionColumnName.primeP, sql`numeric`)
    .addColumn(ElectionColumnName.primeQ, sql`numeric`)
    .addColumn(ElectionColumnName.generator, sql`numeric`)
    .addColumn(ElectionColumnName.electionCreatorId, 'uuid', (col) => col.notNull())
    .addCheckConstraint(
      'votingEnd_after_votingStart',
      sql`"votingEndAt"
        > "votingStartAt"`,
    )
    .execute();

  // Add a trigger to update modifiedAt on row updates
  await sql`
        CREATE TRIGGER ${sql.raw(TableName.election)}_modified_at_trigger
            BEFORE UPDATE
            ON ${sql.table(TableName.election)}
            FOR EACH ROW
            EXECUTE FUNCTION update_modified_at_column();
    `.execute(db);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function createBallotPaperTable(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable(TableName.ballotPaper)
    .$call(addDefaultColumns)
    .addColumn(BallotPaperColumnName.name, 'varchar(256)', (col) => col.notNull())
    .addColumn(BallotPaperColumnName.description, 'varchar(256)')
    .addColumn(BallotPaperColumnName.maxVotes, 'integer', (col) => col.notNull())
    .addColumn(BallotPaperColumnName.maxVotesPerCandidate, 'integer', (col) => col.notNull())
    .addColumn(BallotPaperColumnName.electionId, 'uuid', (col) => col.notNull())
    .addCheckConstraint(
      'maxVotes_and_candidate',
      sql`"maxVotes"
        >= "maxVotesPerCandidate"`,
    )
    .execute();

  // Add a trigger to update modifiedAt on row updates
  await sql`
        CREATE TRIGGER ${sql.raw(TableName.ballotPaper)}_modified_at_trigger
            BEFORE UPDATE
            ON ${sql.table(TableName.ballotPaper)}
            FOR EACH ROW
            EXECUTE FUNCTION update_modified_at_column();
    `.execute(db);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function createBallotPaperSectionTable(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable(TableName.ballotPaperSection)
    .$call(addDefaultColumns)
    .addColumn(BallotPaperSectionColumnName.name, 'varchar(256)', (col) => col.notNull())
    .addColumn(BallotPaperSectionColumnName.description, 'varchar(256)')
    .addColumn(BallotPaperSectionColumnName.maxVotes, 'integer', (col) => col.notNull())
    .addColumn(BallotPaperSectionColumnName.maxVotesPerCandidate, 'integer', (col) => col.notNull())
    .addColumn(BallotPaperSectionColumnName.ballotPaperId, 'uuid', (col) => col.notNull())
    .addCheckConstraint(
      'maxVotes_and_candidate',
      sql`"maxVotes"
        >= "maxVotesPerCandidate"`,
    )
    .execute();

  // Add a trigger to update modifiedAt on row updates
  await sql`
        CREATE TRIGGER ${sql.raw(TableName.ballotPaperSection)}_modified_at_trigger
            BEFORE UPDATE
            ON ${sql.table(TableName.ballotPaperSection)}
            FOR EACH ROW
            EXECUTE FUNCTION update_modified_at_column();
    `.execute(db);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function createBallotPaperSectionCandidateTable(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable(TableName.ballotPaperSectionCandidate)
    .$call(addDefaultColumns)
    .addColumn(BallotPaperSectionCandidateColumnName.ballotPaperSectionId, 'uuid', (col) =>
      col.notNull(),
    )
    .addColumn(BallotPaperSectionCandidateColumnName.candidateId, 'uuid', (col) => col.notNull())
    .execute();

  // Add a trigger to update modifiedAt on row updates
  await sql`
        CREATE TRIGGER ${sql.raw(TableName.ballotPaperSectionCandidate)}_modified_at_trigger
            BEFORE UPDATE
            ON ${sql.table(TableName.ballotPaperSectionCandidate)}
            FOR EACH ROW
            EXECUTE FUNCTION update_modified_at_column();
    `.execute(db);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function createCandidateTable(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable(TableName.candidate)
    .$call(addDefaultColumns)
    .addColumn(CandidateColumnName.title, 'varchar(256)', (col) => col.notNull())
    .addColumn(CandidateColumnName.description, 'varchar(256)')
    .addColumn(CandidateColumnName.electionId, 'uuid', (col) => col.notNull())
    .execute();

  // Add a trigger to update modifiedAt on row updates
  await sql`
        CREATE TRIGGER ${sql.raw(TableName.candidate)}_modified_at_trigger
            BEFORE UPDATE
            ON ${sql.table(TableName.candidate)}
            FOR EACH ROW
            EXECUTE FUNCTION update_modified_at_column();
    `.execute(db);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function createVoterGroupTable(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable(TableName.voterGroup)
    .$call(addDefaultColumns)
    .addColumn(VoterGroupColumnName.name, 'varchar(256)', (col) => col.notNull())
    .addColumn(VoterGroupColumnName.description, 'varchar(256)')
    .addColumn(VoterGroupColumnName.pubKey, 'text')
    .addColumn(VoterGroupColumnName.privKey, 'text')
    .addColumn(VoterGroupColumnName.voterTokensGenerated, 'boolean', (col) =>
      col.notNull().defaultTo(false),
    )
    .execute();

  // Add a trigger to update modifiedAt on row updates
  await sql`
        CREATE TRIGGER ${sql.raw(TableName.voterGroup)}_modified_at_trigger
            BEFORE UPDATE
            ON ${sql.table(TableName.voterGroup)}
            FOR EACH ROW
            EXECUTE FUNCTION update_modified_at_column();
    `.execute(db);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function createVoterTable(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable(TableName.voter)
    .$call(addDefaultColumns)
    .addColumn(VoterColumnName.voterGroupId, 'uuid', (col) => col.notNull())
    .execute();

  // Add a trigger to update modifiedAt on row updates
  await sql`
        CREATE TRIGGER ${sql.raw(TableName.voter)}_modified_at_trigger
            BEFORE UPDATE
            ON ${sql.table(TableName.voter)}
            FOR EACH ROW
            EXECUTE FUNCTION update_modified_at_column();
    `.execute(db);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function createVoterRegisterTable(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable(TableName.voterRegister)
    .$call(addDefaultColumns)
    .addColumn(VoterRegisterColumnName.voted, 'boolean', (col) => col.notNull().defaultTo(false))
    .addColumn(VoterRegisterColumnName.ballotPaperId, 'uuid', (col) => col.notNull())
    .addColumn(VoterRegisterColumnName.voterId, 'uuid', (col) => col.notNull())
    .execute();

  // Add a trigger to update modifiedAt on row updates
  await sql`
        CREATE TRIGGER ${sql.raw(TableName.voterRegister)}_modified_at_trigger
            BEFORE UPDATE
            ON ${sql.table(TableName.voterRegister)}
            FOR EACH ROW
            EXECUTE FUNCTION update_modified_at_column();
    `.execute(db);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function createTables(db: Kysely<any>): Promise<void> {
  await createUserTable(db);
  await createAccessTokenBlacklistTable(db);
  await createElectionTable(db);
  await createBallotPaperTable(db);
  await createBallotPaperSectionTable(db);
  await createBallotPaperSectionCandidateTable(db);
  await createCandidateTable(db);
  await createVoterGroupTable(db);
  await createVoterTable(db);
  await createVoterRegisterTable(db);
}

// --- Foreign Key Helper Functions ---
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function addElectionForeignKeys(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable(TableName.election)
    .addForeignKeyConstraint(
      ElectionFKName.electionCreatorId,
      [ElectionColumnName.electionCreatorId],
      TableName.user,
      [DefaultColumnName.id],
      (cb) => cb.onDelete('cascade').onUpdate('cascade'),
    )
    .execute();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function addBallotPaperForeignKeys(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable(TableName.ballotPaper)
    .addForeignKeyConstraint(
      BallotPaperFKName.electionId,
      [BallotPaperColumnName.electionId],
      TableName.election,
      [DefaultColumnName.id],
      (cb) => cb.onDelete('cascade').onUpdate('cascade'),
    )
    .execute();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function addBallotPaperSectionForeignKeys(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable(TableName.ballotPaperSection)
    .addForeignKeyConstraint(
      BallotPaperSectionFKName.ballotPaperId,
      [BallotPaperSectionColumnName.ballotPaperId],
      TableName.ballotPaper,
      [DefaultColumnName.id],
      (cb) => cb.onDelete('cascade').onUpdate('cascade'),
    )
    .execute();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function addBallotPaperSectionCandidateForeignKeys(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable(TableName.ballotPaperSectionCandidate)
    .addForeignKeyConstraint(
      BallotPaperSectionCandidateFKName.ballotPaperSectionId,
      [BallotPaperSectionCandidateColumnName.ballotPaperSectionId],
      TableName.ballotPaperSection,
      [DefaultColumnName.id],
      (cb) => cb.onDelete('cascade').onUpdate('cascade'),
    )
    .execute();

  await db.schema
    .alterTable(TableName.ballotPaperSectionCandidate)
    .addForeignKeyConstraint(
      BallotPaperSectionCandidateFKName.candidateId,
      [BallotPaperSectionCandidateColumnName.candidateId],
      TableName.candidate,
      [DefaultColumnName.id],
      (cb) => cb.onDelete('cascade').onUpdate('cascade'),
    )
    .execute();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function addCandidateForeignKeys(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable(TableName.candidate)
    .addForeignKeyConstraint(
      CandidateFKName.electionId,
      [CandidateColumnName.electionId],
      TableName.election,
      [DefaultColumnName.id],
      (cb) => cb.onDelete('cascade').onUpdate('cascade'),
    )
    .execute();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function addVoterForeignKeys(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable(TableName.voter)
    .addForeignKeyConstraint(
      VoterFKName.voterGroupId,
      [VoterColumnName.voterGroupId],
      TableName.voterGroup,
      [DefaultColumnName.id],
      (cb) => cb.onDelete('cascade').onUpdate('cascade'),
    )
    .execute();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function addVoterRegisterForeignKeys(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable(TableName.voterRegister)
    .addForeignKeyConstraint(
      VoterRegisterFKName.ballotPaperId,
      [VoterRegisterColumnName.ballotPaperId],
      TableName.ballotPaper,
      [DefaultColumnName.id],
      (cb) => cb.onDelete('cascade').onUpdate('cascade'),
    )
    .execute();

  await db.schema
    .alterTable(TableName.voterRegister)
    .addForeignKeyConstraint(
      VoterRegisterFKName.voterId,
      [VoterRegisterColumnName.voterId],
      TableName.voter,
      [DefaultColumnName.id],
      (cb) => cb.onDelete('cascade').onUpdate('cascade'),
    )
    .execute();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function addForeignKeys(db: Kysely<any>): Promise<void> {
  await addElectionForeignKeys(db);
  await addBallotPaperForeignKeys(db);
  await addBallotPaperSectionForeignKeys(db);
  await addBallotPaperSectionCandidateForeignKeys(db);
  await addCandidateForeignKeys(db);
  await addVoterForeignKeys(db);
  await addVoterRegisterForeignKeys(db);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function up(db: Kysely<any>): Promise<void> {
  // Create the update_modified_at_column function to update modifiedAt on row updates
  await sql`
        CREATE
        OR REPLACE FUNCTION update_modified_at_column()
    RETURNS TRIGGER AS $$
        BEGIN
        NEW.
        ${sql.raw(`"${DefaultColumnName.modifiedAt}"`)}
        = NOW();
        RETURN NEW;
        END;
    $$
        LANGUAGE plpgsql;
    `.execute(db);

  await createTables(db);
  await addForeignKeys(db);

  // initialize pg_cron and create a cron job to delete expired access tokens from the blacklist
  // This job runs every hour at 0 minutes (e.g 00:00, 01:00, 02:00, etc.)
  await sql`
        CREATE EXTENSION IF NOT EXISTS pg_cron
    `.execute(db);

  await sql`
        SELECT cron.schedule(
            'delete_expired_access_tokens_cron_job',
            '0 * * * *',
            $$DELETE FROM ${sql.table(TableName.AccessTokenBlacklist)} WHERE ${sql.raw(`"${AccessTokenBlacklistColumnName.expiresAt}"`)} < NOW()$$
        );
    `.execute(db);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function down(db: Kysely<any>): Promise<void> {
  // Drop the cron job that deletes expired access tokens
  await sql`
        SELECT cron.unschedule('delete_expired_access_tokens_cron_job');
    `.execute(db);

  // Drop the pg_cron extension
  await sql`
        DROP EXTENSION IF EXISTS pg_cron;
    `.execute(db);

  // Drop the update_modified_at_column function
  await sql`
        DROP FUNCTION IF EXISTS update_modified_at_column();
    `.execute(db);

  // Drop tables in reverse order of creation to handle foreign key dependencies
  await db.schema.dropTable(TableName.voterRegister).ifExists().execute();
  await db.schema.dropTable(TableName.voter).ifExists().execute();
  await db.schema.dropTable(TableName.voterGroup).ifExists().execute();
  await db.schema.dropTable(TableName.candidate).ifExists().execute();
  await db.schema.dropTable(TableName.ballotPaperSectionCandidate).ifExists().execute();
  await db.schema.dropTable(TableName.ballotPaperSection).ifExists().execute();
  await db.schema.dropTable(TableName.ballotPaper).ifExists().execute();
  await db.schema.dropTable(TableName.election).ifExists().execute();
  await db.schema.dropTable(TableName.accessTokenBlacklist).ifExists().execute();
  await db.schema.dropTable(TableName.user).ifExists().execute();
}
