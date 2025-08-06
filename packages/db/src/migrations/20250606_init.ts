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
  VoteColumnName,
  VoterColumnName,
  VoterFKName,
  VoterGroupColumnName,
  VoterGroupFKName,
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
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function createVoterGroupTable(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable(TableName.voterGroup)
    .$call(addDefaultColumns)
    .addColumn(VoterGroupColumnName.name, 'varchar(256)', (col) => col.notNull())
    .addColumn(VoterGroupColumnName.description, 'varchar(256)')
    .addColumn(VoterGroupColumnName.pubKey, 'text')
    .addColumn(VoterGroupColumnName.voterGroupCreatorId, 'uuid', (col) => col.notNull())
    .execute();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function createVoterTable(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable(TableName.voter)
    .$call(addDefaultColumns)
    .addColumn(VoterColumnName.voterGroupId, 'uuid', (col) => col.notNull())
    .execute();
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
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function createVoteTable(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable(TableName.vote)
    .$call(addDefaultColumns)
    .addColumn(VoteColumnName.filledBallotPaper, 'jsonb', (col) => col.notNull())
    .addColumn(VoteColumnName.electionId, 'uuid', (col) => col.notNull())
    .addColumn(VoteColumnName.voterId, 'uuid')
    .execute();
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
  await createVoteTable(db);
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
async function addVoterGroupForeignKeys(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable(TableName.voterGroup)
    .addForeignKeyConstraint(
      VoterGroupFKName.voterGroupCreatorId,
      [VoterGroupColumnName.voterGroupCreatorId],
      TableName.user,
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
async function addVoteForeignKeys(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable(TableName.vote)
    .addForeignKeyConstraint(
      VoteColumnName.electionId,
      [VoteColumnName.electionId],
      TableName.election,
      [DefaultColumnName.id],
      (cb) => cb.onDelete('cascade').onUpdate('cascade'),
    )
    .execute();

  await db.schema
    .alterTable(TableName.vote)
    .addForeignKeyConstraint(
      VoteColumnName.voterId,
      [VoteColumnName.voterId],
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
  await addVoterGroupForeignKeys(db);
  await addVoterForeignKeys(db);
  await addVoterRegisterForeignKeys(db);
  await addVoteForeignKeys(db);
}

// --- Modified At Helper Functions ---
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function createModifiedAtFunction(db: Kysely<any>): Promise<void> {
  await sql`
    CREATE OR REPLACE FUNCTION update_modified_at_column()
    RETURNS TRIGGER AS $BODY$
    BEGIN
      NEW.${sql.raw(`"${DefaultColumnName.modifiedAt}"`)} = NOW();
      RETURN NEW;
    END;
    $BODY$ LANGUAGE plpgsql;
  `.execute(db);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function addModifiedAtTriggers(db: Kysely<any>): Promise<void> {
  const tables = [
    TableName.user,
    TableName.accessTokenBlacklist,
    TableName.election,
    TableName.ballotPaper,
    TableName.ballotPaperSection,
    TableName.ballotPaperSectionCandidate,
    TableName.candidate,
    TableName.voterGroup,
    TableName.voter,
    TableName.voterRegister,
  ];

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

// --- MaxVotes Validation Functions ---
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function createMaxVotesValidationFunction(db: Kysely<any>): Promise<void> {
  await sql`
    CREATE OR REPLACE FUNCTION validate_ballot_paper_max_votes()
    RETURNS TRIGGER AS $BODY$
    DECLARE
        ballot_paper_max_votes INTEGER;
        ballot_paper_max_votes_per_candidate INTEGER;
        max_section_votes INTEGER;
        max_section_votes_per_candidate INTEGER;
    BEGIN
        -- Handle different trigger scenarios
        IF TG_OP = 'UPDATE' AND TG_TABLE_NAME = ${sql.lit(TableName.ballotPaper)} THEN
            -- Ballot paper is being updated
            SELECT MAX(${sql.raw(`"${BallotPaperSectionColumnName.maxVotes}"`)}) INTO max_section_votes
            FROM ${sql.table(TableName.ballotPaperSection)}
            WHERE ${sql.raw(`"${BallotPaperSectionColumnName.ballotPaperId}"`)} = NEW.${sql.raw(`"${DefaultColumnName.id}"`)};
            
            SELECT MAX(${sql.raw(`"${BallotPaperSectionColumnName.maxVotesPerCandidate}"`)}) INTO max_section_votes_per_candidate
            FROM ${sql.table(TableName.ballotPaperSection)}
            WHERE ${sql.raw(`"${BallotPaperSectionColumnName.ballotPaperId}"`)} = NEW.${sql.raw(`"${DefaultColumnName.id}"`)};
            
            IF max_section_votes IS NOT NULL AND NEW.${sql.raw(`"${BallotPaperColumnName.maxVotes}"`)} < max_section_votes THEN
                RAISE EXCEPTION 'Ballot paper maxVotes (%) cannot be less than maximum section maxVotes (%)', 
                    NEW.${sql.raw(`"${BallotPaperColumnName.maxVotes}"`)}, max_section_votes;
            END IF;
            
            IF max_section_votes_per_candidate IS NOT NULL AND NEW.${sql.raw(`"${BallotPaperColumnName.maxVotesPerCandidate}"`)} < max_section_votes_per_candidate THEN
                RAISE EXCEPTION 'Ballot paper maxVotesPerCandidate (%) cannot be less than maximum section maxVotesPerCandidate (%)', 
                    NEW.${sql.raw(`"${BallotPaperColumnName.maxVotesPerCandidate}"`)}, max_section_votes_per_candidate;
            END IF;
            
        ELSIF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') AND TG_TABLE_NAME = ${sql.lit(TableName.ballotPaperSection)} THEN
            -- Ballot paper section is being created or updated
            SELECT ${sql.raw(`"${BallotPaperColumnName.maxVotes}"`)}, ${sql.raw(`"${BallotPaperColumnName.maxVotesPerCandidate}"`)} 
            INTO ballot_paper_max_votes, ballot_paper_max_votes_per_candidate
            FROM ${sql.table(TableName.ballotPaper)}
            WHERE ${sql.raw(`"${DefaultColumnName.id}"`)} = NEW.${sql.raw(`"${BallotPaperSectionColumnName.ballotPaperId}"`)};
            
            IF NEW.${sql.raw(`"${BallotPaperSectionColumnName.maxVotes}"`)} > ballot_paper_max_votes THEN
                RAISE EXCEPTION 'Ballot paper section maxVotes (%) cannot be greater than ballot paper maxVotes (%)', 
                    NEW.${sql.raw(`"${BallotPaperSectionColumnName.maxVotes}"`)}, ballot_paper_max_votes;
            END IF;
            
            IF NEW.${sql.raw(`"${BallotPaperSectionColumnName.maxVotesPerCandidate}"`)} > ballot_paper_max_votes_per_candidate THEN
                RAISE EXCEPTION 'Ballot paper section maxVotesPerCandidate (%) cannot be greater than ballot paper maxVotesPerCandidate (%)', 
                    NEW.${sql.raw(`"${BallotPaperSectionColumnName.maxVotesPerCandidate}"`)}, ballot_paper_max_votes_per_candidate;
            END IF;
        END IF;
        
        RETURN NEW;
    END;
    $BODY$ LANGUAGE plpgsql;
  `.execute(db);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function addMaxVotesTriggers(db: Kysely<any>): Promise<void> {
  // Trigger for ballot paper updates
  await sql`
    CREATE TRIGGER ballot_paper_max_votes_validation_trigger
      BEFORE UPDATE OF "maxVotes", "maxVotesPerCandidate"
      ON ${sql.table(TableName.ballotPaper)}
      FOR EACH ROW
      EXECUTE FUNCTION validate_ballot_paper_max_votes();
  `.execute(db);

  // Trigger for ballot paper section inserts
  await sql`
    CREATE TRIGGER ballot_paper_section_insert_max_votes_validation_trigger
      BEFORE INSERT
      ON ${sql.table(TableName.ballotPaperSection)}
      FOR EACH ROW
      EXECUTE FUNCTION validate_ballot_paper_max_votes();
  `.execute(db);

  // Trigger for ballot paper section updates
  await sql`
    CREATE TRIGGER ballot_paper_section_update_max_votes_validation_trigger
      BEFORE UPDATE OF "maxVotes", "maxVotesPerCandidate"
      ON ${sql.table(TableName.ballotPaperSection)}
      FOR EACH ROW
      EXECUTE FUNCTION validate_ballot_paper_max_votes();
  `.execute(db);
}

// --- Cron Job Helper Functions ---
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function setupCronExtensionAndJobs(db: Kysely<any>): Promise<void> {
  // Initialize pg_cron extension
  await sql`
    CREATE EXTENSION IF NOT EXISTS pg_cron
  `.execute(db);

  // Create cron job to delete expired access tokens from the blacklist
  // This job runs every hour at 0 minutes (e.g 00:00, 01:00, 02:00, etc.)
  await sql`
    SELECT cron.schedule(
      'delete_expired_access_tokens_cron_job',
      '0 * * * *',
      $$DELETE FROM ${sql.table(TableName.accessTokenBlacklist)} WHERE ${sql.raw(`"${AccessTokenBlacklistColumnName.expiresAt}"`)} < NOW()$$
    );
  `.execute(db);
}

// --- Drop Helper Functions ---
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function dropCronJobsAndExtension(db: Kysely<any>): Promise<void> {
  // Drop the cron job that deletes expired access tokens
  await sql`
    SELECT cron.unschedule('delete_expired_access_tokens_cron_job');
  `.execute(db);

  // Drop the pg_cron extension
  await sql`
    DROP EXTENSION IF EXISTS pg_cron;
  `.execute(db);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function dropFunctions(db: Kysely<any>): Promise<void> {
  // Drop functions that exist independently of tables
  await sql`
    DROP FUNCTION IF EXISTS validate_ballot_paper_max_votes();
  `.execute(db);

  await sql`
    DROP FUNCTION IF EXISTS update_modified_at_column();
  `.execute(db);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function dropTables(db: Kysely<any>): Promise<void> {
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

// --- Main Migration Functions ---
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function up(db: Kysely<any>): Promise<void> {
  await createModifiedAtFunction(db);
  await createMaxVotesValidationFunction(db);

  await createTables(db);
  await addForeignKeys(db);

  await addModifiedAtTriggers(db);
  await addMaxVotesTriggers(db);

  await setupCronExtensionAndJobs(db);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function down(db: Kysely<any>): Promise<void> {
  await dropCronJobsAndExtension(db);
  // Drop tables (this automatically drops all triggers, constraints, and indexes)
  await dropTables(db);
  await dropFunctions(db);
}
