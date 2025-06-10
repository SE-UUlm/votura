import { type CreateTableBuilder, Kysely, sql } from 'kysely';
import * as nameEnums from '../name_enums.js';

const EMAIL_REGEX = '^[A-Za-z0-9._%+\\-]+@[A-Za-z0-9-]+\\.[A-Za-z]{2,4}$';
const NAME_REGEX = '^[a-zA-Z0-9 .,_:;!?()/\\-]{1,256}$'

// --- Helper Functions ---
const addDefaultColumns = (ctb: CreateTableBuilder<any, any>) => {
  return ctb
    .addColumn(nameEnums.DefaultColumnName.id, 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn(nameEnums.DefaultColumnName.createdAt, 'date', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn(nameEnums.DefaultColumnName.modifiedAt, 'date', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`)) // I don't know how to set this to update automatically
    .addCheckConstraint('modified_after_created', sql`"modifiedAt" >= "createdAt"`);
};

const addNameCheckConstraint = (ctb: CreateTableBuilder<any, any>) => {
  return ctb.addCheckConstraint('valid_name', sql`"name" ~ ${sql.raw(`'${NAME_REGEX}'`)}`);
};

// --- Table Creation Helper Functions ---
async function createUserTable(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable(nameEnums.TableName.User)
    .$call(addDefaultColumns)
    .addColumn(nameEnums.UserColumnName.email, 'varchar(256)', (col) => col.notNull().unique())
    .addColumn(nameEnums.UserColumnName.passwordHash, 'varchar(256)', (col) => col.notNull())
    .addColumn(nameEnums.UserColumnName.verified, 'boolean', (col) => col.notNull().defaultTo(false))
    .addColumn(nameEnums.UserColumnName.emailVerificationTokenHash, 'varchar(64)')
    .addColumn(nameEnums.UserColumnName.emailVerificationTokenExpiresAt, 'timestamptz(6)')
    .addColumn(nameEnums.UserColumnName.passwordResetTokenHash, 'varchar(64)')
    .addColumn(nameEnums.UserColumnName.passwordResetTokenExpiresAt, 'timestamptz(6)')
    .addColumn(nameEnums.UserColumnName.refreshTokenHash, 'varchar(64)')
    .addColumn(nameEnums.UserColumnName.refreshTokenExpiresAt, 'timestamptz(6)')
    .addCheckConstraint(
      'valid_email',
      sql`"email" ~ ${sql.raw(`'${EMAIL_REGEX}'`)}`,
    )
    .execute();
}

async function createAccessTokenBlacklistTable(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable(nameEnums.TableName.AccessTokenBlacklist)
    .$call(addDefaultColumns)
    .addColumn(nameEnums.AccessTokenBlacklistColumnName.accessTokenId, 'uuid', (col) => col.notNull().unique())
    .addColumn(nameEnums.AccessTokenBlacklistColumnName.expiresAt, 'timestamptz(6)', (col) => col.notNull())
    .execute();
}

async function createElectionTable(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable(nameEnums.TableName.Election)
    .$call(addDefaultColumns)
    .addColumn(nameEnums.ElectionColumnName.name, 'varchar(256)', (col) => col.notNull())
    .addColumn(nameEnums.ElectionColumnName.description, 'varchar(256)')
    .addColumn(nameEnums.ElectionColumnName.votingStartAt, 'timestamptz(6)', (col) => col.notNull())
    .addColumn(nameEnums.ElectionColumnName.votingEndAt, 'timestamptz(6)', (col) => col.notNull())
    .addColumn(nameEnums.ElectionColumnName.configFrozen, 'boolean', (col) => col.notNull().defaultTo(false))
    .addColumn(nameEnums.ElectionColumnName.allowInvalidVotes, 'boolean', (col) => col.notNull().defaultTo(false))
    .addColumn(nameEnums.ElectionColumnName.pubKey, sql`numeric`)
    .addColumn(nameEnums.ElectionColumnName.privKey, sql`numeric`)
    .addColumn(nameEnums.ElectionColumnName.primeP, sql`numeric`)
    .addColumn(nameEnums.ElectionColumnName.primeQ, sql`numeric`)
    .addColumn(nameEnums.ElectionColumnName.generator, sql`numeric`)
    .addColumn(nameEnums.ElectionColumnName.electionCreatorId, 'uuid', (col) => col.notNull())
    .addCheckConstraint('votingEnd_after_votingStart', sql`"votingEndAt" > "votingStartAt"`)
    .$call(addNameCheckConstraint)
    .execute();
}

async function createBallotPaperTable(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable(nameEnums.TableName.BallotPaper)
    .$call(addDefaultColumns)
    .addColumn(nameEnums.BallotPaperColumnName.name, 'varchar(256)', (col) => col.notNull())
    .addColumn(nameEnums.BallotPaperColumnName.description, 'varchar(256)')
    .addColumn(nameEnums.BallotPaperColumnName.maxVotes, 'integer', (col) => col.notNull())
    .addColumn(nameEnums.BallotPaperColumnName.maxVotesPerCandidate, 'integer', (col) => col.notNull())
    .addColumn(nameEnums.BallotPaperColumnName.electionId, 'uuid', (col) => col.notNull())
    .addCheckConstraint('maxVotes_and_candidate', sql`"maxVotes" >= "maxVotesPerCandidate"`)
    .$call(addNameCheckConstraint)
    .execute();
}

async function createBallotPaperSectionTable(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable(nameEnums.TableName.BallotPaperSection)
    .$call(addDefaultColumns)
    .addColumn(nameEnums.BallotPaperSectionColumnName.name, 'varchar(256)', (col) => col.notNull())
    .addColumn(nameEnums.BallotPaperSectionColumnName.description, 'varchar(256)')
    .addColumn(nameEnums.BallotPaperSectionColumnName.maxVotes, 'integer', (col) => col.notNull())
    .addColumn(nameEnums.BallotPaperSectionColumnName.maxVotesPerCandidate, 'integer', (col) => col.notNull())
    .addColumn(nameEnums.BallotPaperSectionColumnName.ballotPaperId, 'uuid', (col) => col.notNull())
    .addCheckConstraint('maxVotes_and_candidate', sql`"maxVotes" >= "maxVotesPerCandidate"`)
    .$call(addNameCheckConstraint)
    .execute();
}

async function createBallotPaperSectionCandidateTable(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable(nameEnums.TableName.BallotPaperSectionCandidate)
    .$call(addDefaultColumns)
    .addColumn(nameEnums.BallotPaperSectionCandidateColumnName.ballotPaperSectionId, 'uuid', (col) => col.notNull())
    .addColumn(nameEnums.BallotPaperSectionCandidateColumnName.candidateId, 'uuid', (col) => col.notNull())
    .execute();
}

async function createCandidateTable(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable(nameEnums.TableName.Candidate)
    .$call(addDefaultColumns)
    .addColumn(nameEnums.CandidateColumnName.title, 'varchar(256)', (col) => col.notNull())
    .addColumn(nameEnums.CandidateColumnName.description, 'varchar(256)')
    .addColumn(nameEnums.CandidateColumnName.electionId, 'uuid', (col) => col.notNull())
    .addCheckConstraint('valid_title', sql`"title" ~ ${sql.raw(`'${NAME_REGEX}'`)}`)
    .execute();
}

async function createVoterGroupTable(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable(nameEnums.TableName.VoterGroup)
    .$call(addDefaultColumns)
    .addColumn(nameEnums.VoterGroupColumnName.name, 'varchar(256)', (col) => col.notNull())
    .addColumn(nameEnums.VoterGroupColumnName.description, 'varchar(256)')
    .addColumn(nameEnums.VoterGroupColumnName.pubKey, 'text')
    .addColumn(nameEnums.VoterGroupColumnName.privKey, 'text')
    .addColumn(nameEnums.VoterGroupColumnName.voterTokensGenerated, 'boolean', (col) => col.notNull().defaultTo(false))
    .$call(addNameCheckConstraint)
    .execute();
}

async function createVoterTable(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable(nameEnums.TableName.Voter)
    .$call(addDefaultColumns)
    .addColumn(nameEnums.VoterColumnName.voterGroupId, 'uuid', (col) => col.notNull())
    .execute();
}

async function createVoterRegisterTable(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable(nameEnums.TableName.VoterRegister)
    .$call(addDefaultColumns)
    .addColumn(nameEnums.VoterRegisterColumnName.voted, 'boolean', (col) => col.notNull().defaultTo(false))
    .addColumn(nameEnums.VoterRegisterColumnName.ballotPaperId, 'uuid', (col) => col.notNull())
    .addColumn(nameEnums.VoterRegisterColumnName.voterId, 'uuid', (col) => col.notNull())
    .execute();
}

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
async function addElectionForeignKeys(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable(nameEnums.TableName.Election)
    .addForeignKeyConstraint(
      nameEnums.ElectionFKName.electionCreatorId,
      [nameEnums.ElectionColumnName.electionCreatorId],
      nameEnums.TableName.User,
      [nameEnums.DefaultColumnName.id],
      (cb) => cb.onDelete('restrict').onUpdate('cascade'),
    )
    .execute();
}

async function addBallotPaperForeignKeys(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable(nameEnums.TableName.BallotPaper)
    .addForeignKeyConstraint(
      nameEnums.BallotPaperFKName.electionId,
      [nameEnums.BallotPaperColumnName.electionId],
      nameEnums.TableName.Election,
      [nameEnums.DefaultColumnName.id],
      (cb) => cb.onDelete('restrict').onUpdate('cascade'),
    )
    .execute();
}

async function addBallotPaperSectionForeignKeys(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable(nameEnums.TableName.BallotPaperSection)
    .addForeignKeyConstraint(
      nameEnums.BallotPaperSectionFKName.ballotPaperId,
      [nameEnums.BallotPaperSectionColumnName.ballotPaperId],
      nameEnums.TableName.BallotPaper,
      [nameEnums.DefaultColumnName.id],
      (cb) => cb.onDelete('restrict').onUpdate('cascade'),
    )
    .execute();
}

async function addBallotPaperSectionCandidateForeignKeys(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable(nameEnums.TableName.BallotPaperSectionCandidate)
    .addForeignKeyConstraint(
      nameEnums.BallotPaperSectionCandidateFKName.ballotPaperSectionId,
      [nameEnums.BallotPaperSectionCandidateColumnName.ballotPaperSectionId],
      nameEnums.TableName.BallotPaperSection,
      [nameEnums.DefaultColumnName.id],
      (cb) => cb.onDelete('restrict').onUpdate('cascade'),
    )
    .execute();

  await db.schema
    .alterTable(nameEnums.TableName.BallotPaperSectionCandidate)
    .addForeignKeyConstraint(
      nameEnums.BallotPaperSectionCandidateFKName.candidateId,
      [nameEnums.BallotPaperSectionCandidateColumnName.candidateId],
      nameEnums.TableName.Candidate,
      [nameEnums.DefaultColumnName.id],
      (cb) => cb.onDelete('restrict').onUpdate('cascade'),
    )
    .execute();
}

async function addCandidateForeignKeys(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable(nameEnums.TableName.Candidate)
    .addForeignKeyConstraint(
      nameEnums.CandidateFKName.electionId,
      [nameEnums.CandidateColumnName.electionId],
      nameEnums.TableName.Election,
      [nameEnums.DefaultColumnName.id],
      (cb) => cb.onDelete('restrict').onUpdate('cascade'),
    )
    .execute();
}

async function addVoterForeignKeys(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable(nameEnums.TableName.Voter)
    .addForeignKeyConstraint(
      nameEnums.VoterFKName.voterGroupId,
      [nameEnums.VoterColumnName.voterGroupId],
      nameEnums.TableName.VoterGroup,
      [nameEnums.DefaultColumnName.id],
      (cb) => cb.onDelete('restrict').onUpdate('cascade'),
    )
    .execute();
}

async function addVoterRegisterForeignKeys(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable(nameEnums.TableName.VoterRegister)
    .addForeignKeyConstraint(
      nameEnums.VoterRegisterFKName.ballotPaperId,
      [nameEnums.VoterRegisterColumnName.ballotPaperId],
      nameEnums.TableName.BallotPaper,
      [nameEnums.DefaultColumnName.id],
      (cb) => cb.onDelete('restrict').onUpdate('cascade'),
    )
    .execute();

  await db.schema
    .alterTable(nameEnums.TableName.VoterRegister)
    .addForeignKeyConstraint(
      nameEnums.VoterRegisterFKName.voterId, 
      [nameEnums.VoterRegisterColumnName.voterId],
      nameEnums.TableName.Voter,
      [nameEnums.DefaultColumnName.id],
      (cb) => cb.onDelete('restrict').onUpdate('cascade'),
    )
    .execute();
}

async function addForeignKeys(db: Kysely<any>): Promise<void> {
  await addElectionForeignKeys(db);
  await addBallotPaperForeignKeys(db);
  await addBallotPaperSectionForeignKeys(db);
  await addBallotPaperSectionCandidateForeignKeys(db);
  await addCandidateForeignKeys(db);
  await addVoterForeignKeys(db);
  await addVoterRegisterForeignKeys(db);
}

export async function up(db: Kysely<any>): Promise<void> {
  await createTables(db);
  await addForeignKeys(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  // Drop tables in reverse order of creation to handle foreign key dependencies
  await db.schema.dropTable(nameEnums.TableName.VoterRegister).execute();
  await db.schema.dropTable(nameEnums.TableName.Voter).execute();
  await db.schema.dropTable(nameEnums.TableName.VoterGroup).execute();
  await db.schema.dropTable(nameEnums.TableName.Candidate).execute();
  await db.schema.dropTable(nameEnums.TableName.BallotPaperSectionCandidate).execute();
  await db.schema.dropTable(nameEnums.TableName.BallotPaperSection
  ).execute();
  await db.schema.dropTable(nameEnums.TableName.BallotPaper).execute();
  await db.schema.dropTable(nameEnums.TableName.Election).execute();
  await db.schema.dropTable(nameEnums.TableName.AccessTokenBlacklist).execute();
  await db.schema.dropTable(nameEnums.TableName.User).execute();
}
