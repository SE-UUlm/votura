import { type CreateTableBuilder, Kysely, sql } from 'kysely';

const addDefaultColumns = (ctb: CreateTableBuilder<any, any>) => {
  return ctb
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('createdAt', 'date', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('modifiedAt', 'date', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`)); // I don't know how to set this to update automatically
};

const addNameCheckConstraint = (ctb: CreateTableBuilder<any, any>) => {
  return ctb.addCheckConstraint('valid_name', sql`"name" ~ '^[a-zA-Z0-9 .,_:;!?()/\-]{1,256}$'`);
};

export async function up(db: Kysely<any>): Promise<void> {
  // Create User table
  await db.schema
    .createTable('User')
    .$call(addDefaultColumns)
    .addColumn('email', 'varchar(256)', (col) => col.notNull().unique())
    .addColumn('passwordHash', 'varchar(256)', (col) => col.notNull())
    .addColumn('verified', 'boolean', (col) => col.notNull().defaultTo(false))
    .addColumn('emailVerificationTokenHash', 'varchar(64)')
    .addColumn('emailVerificationTokenExpiresAt', 'timestamptz(6)')
    .addColumn('passwordResetTokenHash', 'varchar(64)')
    .addColumn('passwordResetTokenExpiresAt', 'timestamptz(6)')
    .addColumn('refreshTokenHash', 'varchar(64)')
    .addColumn('refreshTokenExpiresAt', 'timestamptz(6)')
    .addCheckConstraint('modified_after_created', sql`"modifiedAt" >= "createdAt"`)
    .addCheckConstraint(
      'valid_email',
      sql`"email" ~ '^[A-Za-z0-9._%+\-]+@[A-Za-z0-9-]+\.[A-Za-z]{2,4}$'`,
    )
    .execute();

  // Create AccessTokenBlacklist table
  await db.schema
    .createTable('AccessTokenBlacklist')
    .$call(addDefaultColumns)
    .addColumn('accessTokenId', 'uuid', (col) => col.notNull().unique())
    .addColumn('expiresAt', 'timestamptz(6)', (col) => col.notNull())
    .addCheckConstraint('modified_after_created', sql`"modifiedAt" >= "createdAt"`)
    .execute();

  // Create Election table
  await db.schema
    .createTable('Election')
    .$call(addDefaultColumns)
    .addColumn('name', 'varchar(256)', (col) => col.notNull())
    .addColumn('description', 'varchar(256)')
    .addColumn('votingStartAt', 'timestamptz(6)', (col) => col.notNull())
    .addColumn('votingEndAt', 'timestamptz(6)', (col) => col.notNull())
    .addColumn('configFrozen', 'boolean', (col) => col.notNull().defaultTo(false))
    .addColumn('allowInvalidVotes', 'boolean', (col) => col.notNull().defaultTo(false))
    .addColumn('pubKey', sql`numeric`)
    .addColumn('privKey', sql`numeric`)
    .addColumn('primeP', sql`numeric`)
    .addColumn('primeQ', sql`numeric`)
    .addColumn('generator', sql`numeric`)
    .addColumn('electionCreatorId', 'uuid', (col) => col.notNull())
    .addCheckConstraint('votingEnd_after_votingStart', sql`"votingEndAt" > "votingStartAt"`)
    .addCheckConstraint('modified_after_created', sql`"modifiedAt" >= "createdAt"`)
    .$call(addNameCheckConstraint)
    .execute();

  // Create BallotPaper table
  await db.schema
    .createTable('BallotPaper')
    .$call(addDefaultColumns)
    .addColumn('name', 'varchar(256)', (col) => col.notNull())
    .addColumn('description', 'varchar(256)')
    .addColumn('maxVotes', 'integer', (col) => col.notNull())
    .addColumn('maxVotesPerCandidate', 'integer', (col) => col.notNull())
    .addColumn('electionId', 'uuid', (col) => col.notNull())
    .addCheckConstraint('modified_after_created', sql`"modifiedAt" >= "createdAt"`)
    .addCheckConstraint('maxVotes_and_candidate', sql`"maxVotes" >= "maxVotesPerCandidate"`)
    .$call(addNameCheckConstraint)
    .execute();

  // Create BallotPaperSection table
  await db.schema
    .createTable('BallotPaperSection')
    .$call(addDefaultColumns)
    .addColumn('name', 'varchar(256)', (col) => col.notNull())
    .addColumn('description', 'varchar(256)')
    .addColumn('maxVotes', 'integer', (col) => col.notNull())
    .addColumn('maxVotesPerCandidate', 'integer', (col) => col.notNull())
    .addColumn('ballotPaperId', 'uuid', (col) => col.notNull())
    .addCheckConstraint('modified_after_created', sql`"modifiedAt" >= "createdAt"`)
    .addCheckConstraint('maxVotes_and_candidate', sql`"maxVotes" >= "maxVotesPerCandidate"`)
    .$call(addNameCheckConstraint)
    .execute();

  // Create BallotPaperSectionCandidate table
  await db.schema
    .createTable('BallotPaperSectionCandidate')
    .$call(addDefaultColumns)
    .addColumn('ballotPaperSectionId', 'uuid', (col) => col.notNull())
    .addColumn('candidateId', 'uuid', (col) => col.notNull())
    .addCheckConstraint('modified_after_created', sql`"modifiedAt" >= "createdAt"`)
    .execute();

  // Create Candidate table
  await db.schema
    .createTable('Candidate')
    .$call(addDefaultColumns)
    .addColumn('title', 'varchar(256)', (col) => col.notNull())
    .addColumn('description', 'varchar(256)')
    .addColumn('electionId', 'uuid', (col) => col.notNull())
    .addCheckConstraint('modified_after_created', sql`"modifiedAt" >= "createdAt"`)
    .addCheckConstraint('valid_title', sql`"title" ~ '^[a-zA-Z0-9 .,_:;!?()/\\-]{1,256}$'`)
    .execute();

  // Create VoterGroup table
  await db.schema
    .createTable('VoterGroup')
    .$call(addDefaultColumns)
    .addColumn('name', 'varchar(256)', (col) => col.notNull())
    .addColumn('description', 'varchar(256)')
    .addColumn('pubKey', 'text')
    .addColumn('privKey', 'text')
    .addColumn('voterTokensGenerated', 'boolean', (col) => col.notNull().defaultTo(false))
    .addCheckConstraint('modified_after_created', sql`"modifiedAt" >= "createdAt"`)
    .$call(addNameCheckConstraint)
    .execute();

  // Create Voter table
  await db.schema
    .createTable('Voter')
    .$call(addDefaultColumns)
    .addColumn('voterGroupId', 'uuid', (col) => col.notNull())
    .addCheckConstraint('modified_after_created', sql`"modifiedAt" >= "createdAt"`)
    .execute();

  // Create VoterRegister table
  await db.schema
    .createTable('VoterRegister')
    .$call(addDefaultColumns)
    .addColumn('voted', 'boolean', (col) => col.notNull().defaultTo(false))
    .addColumn('ballotPaperId', 'uuid', (col) => col.notNull())
    .addColumn('voterId', 'uuid', (col) => col.notNull())
    .addCheckConstraint('modified_after_created', sql`"modifiedAt" >= "createdAt"`)
    .execute();

  // Add foreign key constraints
  await db.schema
    .alterTable('Election')
    .addForeignKeyConstraint(
      'Election_electionCreatorId_fkey',
      ['electionCreatorId'],
      'User',
      ['id'],
      (cb) => cb.onDelete('restrict').onUpdate('cascade'),
    )
    .execute();

  await db.schema
    .alterTable('BallotPaper')
    .addForeignKeyConstraint(
      'BallotPaper_electionId_fkey',
      ['electionId'],
      'Election',
      ['id'],
      (cb) => cb.onDelete('restrict').onUpdate('cascade'),
    )
    .execute();

  await db.schema
    .alterTable('BallotPaperSection')
    .addForeignKeyConstraint(
      'BallotPaperSection_ballotPaperId_fkey',
      ['ballotPaperId'],
      'BallotPaper',
      ['id'],
      (cb) => cb.onDelete('restrict').onUpdate('cascade'),
    )
    .execute();

  await db.schema
    .alterTable('BallotPaperSectionCandidate')
    .addForeignKeyConstraint(
      'BallotPaperSectionCandidate_ballotPaperSectionId_fkey',
      ['ballotPaperSectionId'],
      'BallotPaperSection',
      ['id'],
      (cb) => cb.onDelete('restrict').onUpdate('cascade'),
    )
    .execute();

  await db.schema
    .alterTable('BallotPaperSectionCandidate')
    .addForeignKeyConstraint(
      'BallotPaperSectionCandidate_candidateId_fkey',
      ['candidateId'],
      'Candidate',
      ['id'],
      (cb) => cb.onDelete('restrict').onUpdate('cascade'),
    )
    .execute();

  await db.schema
    .alterTable('Candidate')
    .addForeignKeyConstraint(
      'Candidate_electionId_fkey',
      ['electionId'],
      'Election',
      ['id'],
      (cb) => cb.onDelete('restrict').onUpdate('cascade'),
    )
    .execute();

  await db.schema
    .alterTable('Voter')
    .addForeignKeyConstraint(
      'Voter_voterGroupId_fkey',
      ['voterGroupId'],
      'VoterGroup',
      ['id'],
      (cb) => cb.onDelete('restrict').onUpdate('cascade'),
    )
    .execute();

  await db.schema
    .alterTable('VoterRegister')
    .addForeignKeyConstraint(
      'VoterRegister_ballotPaperId_fkey',
      ['ballotPaperId'],
      'BallotPaper',
      ['id'],
      (cb) => cb.onDelete('restrict').onUpdate('cascade'),
    )
    .execute();

  await db.schema
    .alterTable('VoterRegister')
    .addForeignKeyConstraint('VoterRegister_voterId_fkey', ['voterId'], 'Voter', ['id'], (cb) =>
      cb.onDelete('restrict').onUpdate('cascade'),
    )
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  // Drop tables in reverse order of creation to handle foreign key dependencies
  await db.schema.dropTable('VoterRegister').execute();
  await db.schema.dropTable('Voter').execute();
  await db.schema.dropTable('VoterGroup').execute();
  await db.schema.dropTable('Candidate').execute();
  await db.schema.dropTable('BallotPaperSectionCandidate').execute();
  await db.schema.dropTable('BallotPaperSection').execute();
  await db.schema.dropTable('BallotPaper').execute();
  await db.schema.dropTable('Election').execute();
  await db.schema.dropTable('AccessTokenBlacklist').execute();
  await db.schema.dropTable('User').execute();
}
