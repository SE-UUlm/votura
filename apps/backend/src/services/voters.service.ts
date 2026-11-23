import { db } from '@repo/db';
import type {
  BallotPaper as DBBallotPaper,
  BallotPaperSection as DBBallotPaperSection,
  Candidate as DBCandidate,
  Election as DBElection,
  Voter as DBVoter,
  VoterGroup as DBVoterGroup,
} from '@repo/db/types';
import type { SelectableVotingElection } from '@repo/votura-validators';
import type { Selectable } from 'kysely';

export async function getVoterGroupIdForVoter(
  voterId: Selectable<DBVoter>['id'],
): Promise<Selectable<DBVoterGroup>['id'] | null> {
  const result = await db
    .selectFrom('voter')
    .innerJoin('voterGroup', 'voter.voterGroupId', 'voterGroup.id')
    .select('voterGroup.id')
    .where('voter.id', '=', voterId)
    .executeTakeFirst();

  return result?.id ?? null;
}

interface VoterElectionRow {
  electionId: Selectable<DBElection>['id'];
  electionName: DBElection['name'];
  electionDescription: DBElection['description'];
  electionPrivate: Selectable<DBElection>['private'];
  electionVotingStartAt: Selectable<DBElection>['votingStartAt'];
  electionVotingEndAt: Selectable<DBElection>['votingEndAt'];
  electionAllowInvalidVotes: Selectable<DBElection>['allowInvalidVotes'];
  electionConfigFrozen: Selectable<DBElection>['configFrozen'];
  electionPubKey: Selectable<DBElection>['pubKey'];
  electionPrimeP: Selectable<DBElection>['primeP'];
  electionPrimeQ: Selectable<DBElection>['primeQ'];
  electionGenerator: Selectable<DBElection>['generator'];
  ballotPaperId: Selectable<DBBallotPaper>['id'];
  ballotPaperName: DBBallotPaper['name'];
  ballotPaperDescription: DBBallotPaper['description'];
  ballotPaperMaxVotes: DBBallotPaper['maxVotes'];
  ballotPaperMaxVotesPerCandidate: DBBallotPaper['maxVotesPerCandidate'];
  ballotPaperSectionId: Selectable<DBBallotPaperSection>['id'];
  ballotPaperSectionName: DBBallotPaperSection['name'];
  ballotPaperSectionDescription: DBBallotPaperSection['description'];
  ballotPaperSectionMaxVotes: DBBallotPaperSection['maxVotes'];
  ballotPaperSectionMaxVotesPerCandidate: DBBallotPaperSection['maxVotesPerCandidate'];
  candidateId: Selectable<DBCandidate>['id'];
  candidateTitle: DBCandidate['title'];
  candidateDescription: DBCandidate['description'];
}

async function getVoterElectionData(
  voterId: Selectable<DBVoter>['id'],
): Promise<VoterElectionRow[]> {
  return db
    .selectFrom('election as e')
    .innerJoin('ballotPaper as bp', 'e.id', 'bp.electionId')
    .innerJoin('voterRegister as vr', 'bp.id', 'vr.ballotPaperId')
    .innerJoin('ballotPaperSection as bps', 'bp.id', 'bps.ballotPaperId')
    .innerJoin('ballotPaperSectionCandidate as bpsc', 'bps.id', 'bpsc.ballotPaperSectionId')
    .innerJoin('candidate as c', 'bpsc.candidateId', 'c.id')
    .select([
      'e.id as electionId',
      'e.name as electionName',
      'e.description as electionDescription',
      'e.private as electionPrivate',
      'e.votingStartAt as electionVotingStartAt',
      'e.votingEndAt as electionVotingEndAt',
      'e.allowInvalidVotes as electionAllowInvalidVotes',
      'e.configFrozen as electionConfigFrozen',
      'e.pubKey as electionPubKey',
      'e.primeP as electionPrimeP',
      'e.primeQ as electionPrimeQ',
      'e.generator as electionGenerator',
      'bp.id as ballotPaperId',
      'bp.name as ballotPaperName',
      'bp.description as ballotPaperDescription',
      'bp.maxVotes as ballotPaperMaxVotes',
      'bp.maxVotesPerCandidate as ballotPaperMaxVotesPerCandidate',
      'bps.id as ballotPaperSectionId',
      'bps.name as ballotPaperSectionName',
      'bps.description as ballotPaperSectionDescription',
      'bps.maxVotes as ballotPaperSectionMaxVotes',
      'bps.maxVotesPerCandidate as ballotPaperSectionMaxVotesPerCandidate',
      'c.id as candidateId',
      'c.title as candidateTitle',
      'c.description as candidateDescription',
    ])
    .where('vr.voterId', '=', voterId)
    .where('vr.voted', '=', false)
    .orderBy('e.id')
    .orderBy('bp.id')
    .orderBy('bps.id')
    .orderBy('c.id')
    .execute();
}

function createElectionFromRow(row: VoterElectionRow): SelectableVotingElection {
  return {
    id: row.electionId,
    name: row.electionName,
    description: row.electionDescription ?? undefined,
    private: row.electionPrivate,
    votingStartAt: row.electionVotingStartAt.toISOString(),
    votingEndAt: row.electionVotingEndAt.toISOString(),
    allowInvalidVotes: row.electionAllowInvalidVotes,
    configFrozen: row.electionConfigFrozen,
    pubKey: row.electionPubKey ?? undefined,
    primeP: row.electionPrimeP ?? undefined,
    primeQ: row.electionPrimeQ ?? undefined,
    generator: row.electionGenerator ?? undefined,
    ballotPaper: {
      id: row.ballotPaperId,
      name: row.ballotPaperName,
      description: row.ballotPaperDescription ?? undefined,
      maxVotes: row.ballotPaperMaxVotes,
      maxVotesPerCandidate: row.ballotPaperMaxVotesPerCandidate,
      ballotPaperSections: [],
    },
  };
}

function createBallotPaperSection(
  row: VoterElectionRow,
): SelectableVotingElection['ballotPaper']['ballotPaperSections'][0] {
  return {
    id: row.ballotPaperSectionId,
    name: row.ballotPaperSectionName,
    description: row.ballotPaperSectionDescription ?? undefined,
    maxVotes: row.ballotPaperSectionMaxVotes,
    maxVotesPerCandidate: row.ballotPaperSectionMaxVotesPerCandidate,
    candidates: [],
  };
}

function createCandidate(
  row: VoterElectionRow,
): SelectableVotingElection['ballotPaper']['ballotPaperSections'][0]['candidates'][0] {
  return {
    id: row.candidateId,
    title: row.candidateTitle,
    description: row.candidateDescription ?? undefined,
  };
}

export async function getSelectableVotingElectionForVoter(
  voterId: Selectable<DBVoter>['id'],
): Promise<SelectableVotingElection[]> {
  const electionsData = await getVoterElectionData(voterId);
  const electionsMap = new Map<string, SelectableVotingElection>();

  for (const row of electionsData) {
    let election = electionsMap.get(row.electionId);
    if (election === undefined) {
      election = createElectionFromRow(row);
      electionsMap.set(row.electionId, election);
    }

    let section = election.ballotPaper.ballotPaperSections.find(
      (s) => s.id === row.ballotPaperSectionId,
    );
    if (section === undefined) {
      section = createBallotPaperSection(row);
      election.ballotPaper.ballotPaperSections.push(section);
    }

    const candidateExists = section.candidates.some((c) => c.id === row.candidateId);
    if (!candidateExists) {
      // section is passed by reference, so we can directly push to it
      section.candidates.push(createCandidate(row));
    }
  }

  return Array.from(electionsMap.values());
}

/**
 * Checks wether the voter with the given voterId is allowed to vote on the given ballot paper.
 * This is the case if the ballot paper exists, is assigned to the voter and the voter has not voted yet.
 * Before allowing a vote, one should also check if the election the ballot paper belongs to is votable (has started and not ended).
 *
 * @param voterId The ID of the voter to check.
 * @param ballotPaperId The ID of the ballot paper to check.
 * @returns A promise that resolves to a boolean. True if the voter is allowed to vote on the ballot paper, false otherwise.
 */
export async function checkVoterMayVoteOnBallotPaper(
  voterId: Selectable<DBVoter>['id'],
  ballotPaperId: Selectable<DBBallotPaper>['id'],
): Promise<boolean> {
  const registerId = await db
    .selectFrom('voterRegister')
    .where('voterId', '=', voterId)
    .where('ballotPaperId', '=', ballotPaperId)
    .where('voted', '=', false)
    .select('id')
    .executeTakeFirst();

  return registerId !== undefined;
}
