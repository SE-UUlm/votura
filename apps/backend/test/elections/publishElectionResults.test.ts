import { db } from '@repo/db';
import { BallotPaperEncryption } from '@repo/votura-ballot-box';
import {
  filledBallotPaperDefaultVoteOption,
  parameter,
  response403Object,
  selectableElectionObject,
  selectableElectionResultObject,
  type ApiTokenUser,
  type SelectableBallotPaperSection,
  type SelectableCandidate,
  type SelectableElection,
  type SelectableElectionResult,
} from '@repo/votura-validators';
import {
  getKeyPair,
  PublicKey,
  ZeroKnowledgeProof,
  type Ciphertext,
} from '@votura/votura-crypto/index';
import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';
import { app } from '../../src/app.js';
import { generateUserTokens } from '../../src/auth/utils.js';
import { HttpStatusCode } from '../../src/httpStatusCode.js';
import { createBallotPaper } from '../../src/services/ballotPapers.service.js';
import {
  addCandidateToBallotPaperSection,
  createBallotPaperSection,
} from '../../src/services/ballotPaperSections.service.js';
import { createCandidate } from '../../src/services/candidates.service.js';
import { createUser, findUserBy } from '../../src/services/users.service.js';
import {
  createVoterGroup,
  getVoterIdsForVoterGroup,
} from '../../src/services/voterGroups.service.js';
import { persistVote } from '../../src/services/votes.service.js';
import {
  demoBallotPaper,
  demoBallotPaperSection,
  demoCandidate,
  demoElection,
  demoUser,
  demoUser2,
  invalidAllowedElection,
  voterGroupNoBallotPapers,
} from '../mockData.js';
import {
  createElection,
  freezeElection as freezeElectionService,
  setElectionKeys,
} from './../../src/services/elections.service.js';

/**
 * Freezes the election and sets its keys directly in the database.
 * This avoids waiting for the real (asynchronous) key generation process.
 */
const freezeElectionWithKeys = async (electionId: SelectableElection['id']): Promise<PublicKey> => {
  const { keyGenStartedAt } = await freezeElectionService(electionId);
  const keyPair = await getKeyPair(20);
  await setElectionKeys(keyPair, electionId, keyGenStartedAt);
  return keyPair.publicKey;
};

/**
 * Moves the voting period of the election into the past.
 */
const endVoting = async (electionId: SelectableElection['id']): Promise<void> => {
  await db
    .updateTable('election')
    .set({
      votingStartAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      votingEndAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    })
    .where('id', '=', electionId)
    .execute();
};

/**
 * Checks the decryption proof of an aggregated ciphertext against the published count.
 */
const verifyCount = (
  result: SelectableElectionResult,
  count: number,
  ciphertext: { alpha: string; beta: string },
  proof: { commitment1: string; commitment2: string; challenge: string; response: string },
): boolean => {
  const primeP = BigInt(result.primeP ?? '');
  const generator = BigInt(result.generator ?? '');
  const publicKey = new PublicKey(
    primeP,
    BigInt(result.primeQ ?? ''),
    generator,
    BigInt(result.pubKey ?? ''),
  );
  // The plaintext of a count is generator ^ count mod primeP
  let plaintext = 1n;
  for (let i = 0; i < count; i++) {
    plaintext = (plaintext * generator) % primeP;
  }
  const aggregatedCiphertext: Ciphertext = [BigInt(ciphertext.alpha), BigInt(ciphertext.beta)];

  return new ZeroKnowledgeProof(publicKey).verifyDecryptionProof(plaintext, aggregatedCiphertext, {
    commitment: [BigInt(proof.commitment1), BigInt(proof.commitment2)],
    challenge: BigInt(proof.challenge),
    response: BigInt(proof.response),
  });
};

describe(`PUT /elections/:${parameter.electionId}/publishResults`, () => {
  let election: SelectableElection | null = null;
  let notFrozenElection: SelectableElection | null = null;
  let votingNotEndedElection: SelectableElection | null = null;
  let section: SelectableBallotPaperSection | null = null;
  let candidate1: SelectableCandidate | null = null;
  let candidate2: SelectableCandidate | null = null;
  let tokens: ApiTokenUser = { accessToken: '', refreshToken: '' };
  let tokens2: ApiTokenUser = { accessToken: '', refreshToken: '' };

  beforeAll(async () => {
    await createUser(demoUser);
    await createUser(demoUser2);
    const user = await findUserBy({ email: demoUser.email });
    const user2 = await findUserBy({ email: demoUser2.email });
    if (user === null || user2 === null) {
      throw new Error('Failed to find test user');
    }

    election = await createElection(invalidAllowedElection, user.id);
    const ballotPaper = await createBallotPaper(demoBallotPaper, election.id);
    section = await createBallotPaperSection(demoBallotPaperSection, ballotPaper.id);
    candidate1 = await createCandidate(demoCandidate, election.id);
    candidate2 = await createCandidate({ ...demoCandidate, title: 'Candidate 2' }, election.id);
    await addCandidateToBallotPaperSection(section.id, candidate1.id);
    await addCandidateToBallotPaperSection(section.id, candidate2.id);
    const voterGroup = await createVoterGroup(
      { ...voterGroupNoBallotPapers, numberOfVoters: 3, ballotPapers: [ballotPaper.id] },
      user.id,
    );
    const publicKey = await freezeElectionWithKeys(election.id);

    // Each vote of the section contains exactly one chosen option (maxVotes of the section is 4)
    const options = [
      candidate1.id,
      candidate2.id,
      filledBallotPaperDefaultVoteOption.noVote,
      filledBallotPaperDefaultVoteOption.invalid,
    ];
    const { noVote, invalid } = filledBallotPaperDefaultVoteOption;
    const ballots = [
      [candidate1.id, candidate1.id, candidate2.id, noVote],
      [candidate2.id, noVote, noVote, noVote],
      [invalid, invalid, invalid, invalid],
    ];
    const voterIds = await getVoterIdsForVoterGroup(voterGroup.id);
    const bpEncryption = new BallotPaperEncryption(publicKey);
    for (const [index, choices] of ballots.entries()) {
      const votes = choices.map((choice) =>
        Object.fromEntries(options.map((option) => [option, option === choice ? 1 : 0])),
      );
      const encryptedBallotPaper = bpEncryption.encryptBallotPaper({
        ballotPaperId: ballotPaper.id,
        sections: { [section.id]: { votes } },
      })[0];
      await persistVote(voterIds[index] ?? '', encryptedBallotPaper);
    }
    await endVoting(election.id);

    notFrozenElection = await createElection(demoElection, user.id);
    await endVoting(notFrozenElection.id);

    votingNotEndedElection = await createElection(demoElection, user.id);
    const notEndedBallotPaper = await createBallotPaper(demoBallotPaper, votingNotEndedElection.id);
    await createBallotPaperSection(demoBallotPaperSection, notEndedBallotPaper.id);
    await freezeElectionWithKeys(votingNotEndedElection.id);

    tokens = generateUserTokens(user.id);
    tokens2 = generateUserTokens(user2.id);
  });

  it('403: should not allow publishing the results of an election of another user', async () => {
    const res = await request(app)
      .put(`/elections/${election?.id}/publishResults`)
      .set('Authorization', `Bearer ${tokens2.accessToken}`);
    expect(res.status).toBe(HttpStatusCode.forbidden);
    expect(res.type).toBe('application/json');
    expect(response403Object.safeParse(res.body).success).toBe(true);
  });
  it('200: should publish the results with valid decryption proofs', async () => {
    const res = await request(app)
      .put(`/elections/${election?.id}/publishResults`)
      .set('Authorization', `Bearer ${tokens.accessToken}`);
    expect(res.status).toBe(HttpStatusCode.ok);
    expect(res.type).toBe('application/json');
    const parseResult = selectableElectionResultObject.safeParse(res.body);
    expect(parseResult.success).toBe(true);
    if (!parseResult.success) {
      throw new Error('Failed to parse election result');
    }

    const result = parseResult.data;
    const ballotPaperResult = result.ballotPapers[0];
    const sectionResult = ballotPaperResult?.ballotPaperSections[0];
    expect(result.electionId).toBe(election?.id);
    expect(ballotPaperResult?.ballotsCast).toBe(3);
    expect(ballotPaperResult?.invalidCount).toBe(1);
    expect(sectionResult?.id).toBe(section?.id);
    expect(sectionResult?.noVoteCount).toBe(4);
    expect(sectionResult?.candidates.find((c) => c.id === candidate1?.id)?.count).toBe(2);
    expect(sectionResult?.candidates.find((c) => c.id === candidate2?.id)?.count).toBe(2);
    expect(sectionResult?.candidates.find((c) => c.id === candidate2?.id)?.title).toBe(
      'Candidate 2',
    );

    if (sectionResult === undefined) {
      throw new Error('Missing section result');
    }
    for (const candidate of sectionResult.candidates) {
      expect(verifyCount(result, candidate.count, candidate.ciphertext, candidate.proof)).toBe(
        true,
      );
    }
    expect(
      verifyCount(
        result,
        sectionResult.noVoteCount,
        sectionResult.noVoteCiphertext,
        sectionResult.noVoteProof,
      ),
    ).toBe(true);
    expect(
      verifyCount(
        result,
        (ballotPaperResult?.invalidCount ?? 0) * sectionResult.maxVotes,
        sectionResult.invalidCiphertext,
        sectionResult.invalidProof,
      ),
    ).toBe(true);
    // A wrong count must not be accepted by the proof
    expect(verifyCount(result, 3, sectionResult.noVoteCiphertext, sectionResult.noVoteProof)).toBe(
      false,
    );

    const electionRes = await request(app)
      .get(`/elections/${election?.id}`)
      .set('Authorization', `Bearer ${tokens.accessToken}`);
    const electionParseResult = selectableElectionObject.safeParse(electionRes.body);
    expect(electionParseResult.data?.resultsPublishedAt).toBe(result.publishedAt);
  });
  it('403: should not allow publishing the results a second time', async () => {
    const res = await request(app)
      .put(`/elections/${election?.id}/publishResults`)
      .set('Authorization', `Bearer ${tokens.accessToken}`);
    expect(res.status).toBe(HttpStatusCode.forbidden);
    expect(res.type).toBe('application/json');
    expect(response403Object.safeParse(res.body).success).toBe(true);
  });
  it('403: should not allow unfreezing an election with published results', async () => {
    const res = await request(app)
      .put(`/elections/${election?.id}/unfreeze`)
      .set('Authorization', `Bearer ${tokens.accessToken}`);
    expect(res.status).toBe(HttpStatusCode.forbidden);
    expect(res.type).toBe('application/json');
    expect(response403Object.safeParse(res.body).success).toBe(true);
  });
  it('403: should not allow publishing the results of an election that is not frozen', async () => {
    const res = await request(app)
      .put(`/elections/${notFrozenElection?.id}/publishResults`)
      .set('Authorization', `Bearer ${tokens.accessToken}`);
    expect(res.status).toBe(HttpStatusCode.forbidden);
    expect(res.type).toBe('application/json');
    expect(response403Object.safeParse(res.body).success).toBe(true);
  });
  it('403: should not allow publishing the results before the voting has ended', async () => {
    const res = await request(app)
      .put(`/elections/${votingNotEndedElection?.id}/publishResults`)
      .set('Authorization', `Bearer ${tokens.accessToken}`);
    expect(res.status).toBe(HttpStatusCode.forbidden);
    expect(res.type).toBe('application/json');
    expect(response403Object.safeParse(res.body).success).toBe(true);
  });
});
