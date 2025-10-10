import { BallotPaperEncryption } from '@repo/votura-ballot-box';
import {
  filledBallotPaperDefaultVoteOption,
  response400Object,
  response403Object,
  selectableElectionObject,
  type EncryptedFilledBallotPaper,
  type PlainFilledBallotPaper,
  type SelectableBallotPaper,
  type SelectableBallotPaperSection,
  type SelectableCandidate,
} from '@repo/votura-validators';
import { PublicKey } from '@votura/votura-crypto/index';
import { randomUUID } from 'crypto';
import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';
import { app } from '../../src/app.js';
import { generateUserTokens } from '../../src/auth/utils.js';
import { VoteValidationErrorMessage } from '../../src/controllers/bodyChecks/voteChecks.js';
import { HttpStatusCode } from '../../src/httpStatusCode.js';
import { createBallotPaper } from '../../src/services/ballotPapers.service.js';
import {
  addCandidateToBallotPaperSection,
  createBallotPaperSection,
} from '../../src/services/ballotPaperSections.service.js';
import { createCandidate } from '../../src/services/candidates.service.js';
import { createElection } from '../../src/services/elections.service.js';
import { createUser, findUserBy } from '../../src/services/users.service.js';
import { createVoterGroup } from '../../src/services/voterGroups.service.js';
import {
  demoBallotPaper,
  demoBallotPaperSection,
  demoCandidate,
  demoElection,
  demoUser,
  invalidAllowedElection as invalidAllowedElectionData,
  voterGroupNoBallotPapers,
} from '../mockData.js';
import { sleep } from '../utils.js';

function createEncryptedBallotPaper(
  publicKey: PublicKey,
  ballotPaperId: string,
  section1Id: string,
  section2Id: string,
  section1Votes: Record<string, number>[],
  section2Votes: Record<string, number>[],
): EncryptedFilledBallotPaper {
  const plainBP: PlainFilledBallotPaper = {
    ballotPaperId: ballotPaperId,
    sections: {
      [section1Id]: {
        votes: section1Votes,
      },
      [section2Id]: {
        votes: section2Votes,
      },
    },
  };
  const bpEncryption = new BallotPaperEncryption(publicKey);
  return bpEncryption.encryptBallotPaper(plainBP)[0];
}

// The tests in this file are for the most part deliberately ordered in the order the checks are performed
// With this, the sent ballot paper only has to conform to all previous tests to make sure the check to test works

describe(`POST /voting/castVote`, () => {
  const submitVotePath = '/voting/castVote';
  let voterToken: string | undefined = '';
  let unvotableElectionPubKey: PublicKey | null = null;
  let unvotableBallotPaper: SelectableBallotPaper | null = null;
  let invalidAllowedElectionPubKey: PublicKey | null = null;
  let invalidAllowedBallotPaper: SelectableBallotPaper | null = null;
  let invalidAllowedBallotPaperSection1: SelectableBallotPaperSection | null = null;
  let invalidAllowedBallotPaperSection2: SelectableBallotPaperSection | null = null;
  let invalidForbiddenElectionPubKey: PublicKey | null = null;
  let invalidForbiddenBallotPaper: SelectableBallotPaper | null = null;
  let invalidForbiddenBallotPaperSection1: SelectableBallotPaperSection | null = null;
  let invalidForbiddenBallotPaperSection2: SelectableBallotPaperSection | null = null;
  let invalidAllowedCandidate1: SelectableCandidate | null = null;
  let invalidAllowedCandidate2: SelectableCandidate | null = null;
  let invalidForbiddenCandidate1: SelectableCandidate | null = null;
  let invalidForbiddenCandidate2: SelectableCandidate | null = null;

  beforeAll(async () => {
    await createUser(demoUser);
    const user = await findUserBy({ email: demoUser.email });
    if (user === null) throw new Error('User was not created successfully in the database');

    // create two votable elections, both with a ballot paper, two sections and two candidates each
    // one allowing invalid votes, one not allowing invalid votes
    // both elections start in 30 seconds, so that they become votable after a short wait
    const votingStartAt = new Date(Date.now() + 30_000); // in 30 seconds
    const invalidAllowedElection = await createElection(
      {
        ...invalidAllowedElectionData,
        votingStartAt: votingStartAt.toISOString(),
      },
      user.id,
    );
    const invalidForbiddenElection = await createElection(
      { ...demoElection, votingStartAt: votingStartAt.toISOString() },
      user.id,
    );

    invalidAllowedBallotPaper = await createBallotPaper(
      { ...demoBallotPaper, name: 'Invalid allowed ballot paper' },
      invalidAllowedElection.id,
    );
    invalidForbiddenBallotPaper = await createBallotPaper(
      { ...demoBallotPaper, name: 'Invalid forbidden ballot paper' },
      invalidForbiddenElection.id,
    );

    invalidAllowedBallotPaperSection1 = await createBallotPaperSection(
      {
        ...demoBallotPaperSection,
        name: 'Invalid allowed ballot paper section 1',
      },
      invalidAllowedBallotPaper.id,
    );
    invalidAllowedBallotPaperSection2 = await createBallotPaperSection(
      {
        ...demoBallotPaperSection,
        name: 'Invalid allowed ballot paper section 2',
      },
      invalidAllowedBallotPaper.id,
    );
    invalidForbiddenBallotPaperSection1 = await createBallotPaperSection(
      {
        ...demoBallotPaperSection,
        name: 'Invalid forbidden ballot paper section 1',
      },
      invalidForbiddenBallotPaper.id,
    );
    invalidForbiddenBallotPaperSection2 = await createBallotPaperSection(
      {
        ...demoBallotPaperSection,
        name: 'Invalid forbidden ballot paper section 2',
      },
      invalidForbiddenBallotPaper.id,
    );

    invalidAllowedCandidate1 = await createCandidate(
      { ...demoCandidate, title: 'Invalid allowed Candidate 1' },
      invalidAllowedElection.id,
    );
    invalidAllowedCandidate2 = await createCandidate(
      { ...demoCandidate, title: 'Invalid allowed Candidate 2' },
      invalidAllowedElection.id,
    );
    invalidForbiddenCandidate1 = await createCandidate(
      { ...demoCandidate, title: 'Invalid forbidden Candidate 1' },
      invalidForbiddenElection.id,
    );
    invalidForbiddenCandidate2 = await createCandidate(
      { ...demoCandidate, title: 'Invalid forbidden Candidate 2' },
      invalidForbiddenElection.id,
    );

    await addCandidateToBallotPaperSection(
      invalidAllowedBallotPaperSection1.id,
      invalidAllowedCandidate1.id,
    );
    await addCandidateToBallotPaperSection(
      invalidAllowedBallotPaperSection1.id,
      invalidAllowedCandidate2.id,
    );
    await addCandidateToBallotPaperSection(
      invalidAllowedBallotPaperSection2.id,
      invalidAllowedCandidate1.id,
    );
    await addCandidateToBallotPaperSection(
      invalidAllowedBallotPaperSection2.id,
      invalidAllowedCandidate2.id,
    );
    await addCandidateToBallotPaperSection(
      invalidForbiddenBallotPaperSection1.id,
      invalidForbiddenCandidate1.id,
    );
    await addCandidateToBallotPaperSection(
      invalidForbiddenBallotPaperSection1.id,
      invalidForbiddenCandidate2.id,
    );
    await addCandidateToBallotPaperSection(
      invalidForbiddenBallotPaperSection2.id,
      invalidForbiddenCandidate1.id,
    );
    await addCandidateToBallotPaperSection(
      invalidForbiddenBallotPaperSection2.id,
      invalidForbiddenCandidate2.id,
    );

    // create unvotable election with ballot paper, section and candidate (unvotable because election starts in the future)
    const unvotableElection = await createElection({ ...demoElection }, user.id);
    unvotableBallotPaper = await createBallotPaper({ ...demoBallotPaper }, unvotableElection.id);
    const unvotableBallotPaperSection = await createBallotPaperSection(
      { ...demoBallotPaperSection },
      unvotableBallotPaper.id,
    );
    const unvotableCandidate = await createCandidate({ ...demoCandidate }, unvotableElection.id);
    await addCandidateToBallotPaperSection(unvotableBallotPaperSection.id, unvotableCandidate.id);

    // create voter group with both ballot papers assigned to it
    const voterGroup = await createVoterGroup(
      {
        ...voterGroupNoBallotPapers,
        numberOfVoters: 1,
        ballotPapers: [
          invalidAllowedBallotPaper.id,
          invalidForbiddenBallotPaper.id,
          unvotableBallotPaper.id,
        ],
      },
      user.id,
    );

    // freeze both elections
    const userTokens = generateUserTokens(user.id);

    let res1 = await request(app)
      .put(`/elections/${invalidAllowedElection.id}/freeze`)
      .set('Authorization', `Bearer ${userTokens.accessToken}`);
    let parseResult1 = selectableElectionObject.safeParse(res1.body);
    if (!parseResult1.success) {
      throw new Error('Failed to parse election with allowed invalid votes');
    }

    let res2 = await request(app)
      .put(`/elections/${invalidForbiddenElection.id}/freeze`)
      .set('Authorization', `Bearer ${userTokens.accessToken}`);
    let parseResult2 = selectableElectionObject.safeParse(res2.body);
    if (!parseResult2.success) {
      throw new Error('Failed to parse election with forbidden invalid votes');
    }

    let res3 = await request(app)
      .put(`/elections/${unvotableElection.id}/freeze`)
      .set('Authorization', `Bearer ${userTokens.accessToken}`);
    let parseResult3 = selectableElectionObject.safeParse(res3.body);
    if (!parseResult3.success) {
      throw new Error('Failed to parse unvotable election');
    }

    // wait for the cryptographic keys of the elections to be generated
    while (
      parseResult1.data.pubKey === undefined ||
      parseResult2.data.pubKey === undefined ||
      parseResult3.data.pubKey === undefined
    ) {
      await sleep(5000);

      res1 = await request(app)
        .get(`/elections/${invalidAllowedElection?.id}`)
        .set('Authorization', `Bearer ${userTokens.accessToken}`);
      parseResult1 = selectableElectionObject.safeParse(res1.body);
      if (!parseResult1.success) {
        throw new Error('Failed to parse election with allowed invalid votes');
      }

      res2 = await request(app)
        .get(`/elections/${invalidForbiddenElection?.id}`)
        .set('Authorization', `Bearer ${userTokens.accessToken}`);
      parseResult2 = selectableElectionObject.safeParse(res2.body);
      if (!parseResult2.success) {
        throw new Error('Failed to parse election with forbidden invalid votes');
      }

      res3 = await request(app)
        .get(`/elections/${unvotableElection?.id}`)
        .set('Authorization', `Bearer ${userTokens.accessToken}`);
      parseResult3 = selectableElectionObject.safeParse(res3.body);
      if (!parseResult3.success) {
        throw new Error('Failed to parse unvotable election');
      }
    }
    // create public keys for each election to be able to encrypt ballot papers
    if (
      parseResult1.data.primeP === undefined ||
      parseResult1.data.primeQ === undefined ||
      parseResult1.data.generator === undefined
    ) {
      throw new Error('could not create PubKey for invalidAllowed Election');
    }
    invalidAllowedElectionPubKey = new PublicKey(
      BigInt(parseResult1.data.primeP),
      BigInt(parseResult1.data.primeQ),
      BigInt(parseResult1.data.generator),
      BigInt(parseResult1.data.pubKey),
    );

    if (
      parseResult2.data.primeP === undefined ||
      parseResult2.data.primeQ === undefined ||
      parseResult2.data.generator === undefined
    ) {
      throw new Error('could not create PubKey for invalidForbidden Election');
    }
    invalidForbiddenElectionPubKey = new PublicKey(
      BigInt(parseResult2.data.primeP),
      BigInt(parseResult2.data.primeQ),
      BigInt(parseResult2.data.generator),
      BigInt(parseResult2.data.pubKey),
    );

    if (
      parseResult3.data.primeP === undefined ||
      parseResult3.data.primeQ === undefined ||
      parseResult3.data.generator === undefined
    ) {
      throw new Error('could not create PubKey for unvotable Election');
    }
    unvotableElectionPubKey = new PublicKey(
      BigInt(parseResult3.data.primeP),
      BigInt(parseResult3.data.primeQ),
      BigInt(parseResult3.data.generator),
      BigInt(parseResult3.data.pubKey),
    );

    // create voter token
    const voterTokenResponse = await request(app)
      .get(`/voterGroups/${voterGroup.id}/createVoterTokens`)
      .set('Authorization', `Bearer ${userTokens.accessToken}`);
    if (voterTokenResponse.statusCode !== Number(HttpStatusCode.ok)) {
      throw new Error('Failed to create voter token');
    }
    voterToken = (voterTokenResponse.body as string[])[0];
    if (voterToken === undefined) {
      throw new Error('No voter token returned');
    }

    // wait until 3 seconds after voting start
    if (Date.now() < votingStartAt.getTime() + 2000) {
      await sleep(votingStartAt.getTime() + 2000 - Date.now());
    }
  }, 60_000 /* 60 seconds timeout */);

  // invalid request body (does not meet schema specifications)
  it('400: request body does not meet zod schema specifications', async () => {
    const res = await request(app)
      .post(submitVotePath)
      .set('Authorization', `Bearer ${voterToken}`)
      .send({
        ballotPaperId: 123, // should be string
        sections: 'not-an-object', // should be object
      });
    expect(res.statusCode).toBe(HttpStatusCode.badRequest);
    expect(res.type).toBe('application/json');
    const parseResult = response400Object.safeParse(res.body);
    expect(parseResult.success).toBe(true);
  });

  // election is not votable (not started yet, or already ended, not frozen)
  it('403: election is not votable (not started yet)', async () => {
    if (unvotableElectionPubKey === null || unvotableBallotPaper === null) {
      throw new Error('Unvotable election or ballot paper is null');
    }

    const res = await request(app)
      .post(submitVotePath)
      .set('Authorization', `Bearer ${voterToken}`)
      .send(
        createEncryptedBallotPaper(
          unvotableElectionPubKey,
          unvotableBallotPaper.id,
          randomUUID(),
          randomUUID(),
          [
            {
              [randomUUID()]: 1,
              [filledBallotPaperDefaultVoteOption.noVote]: 0,
              [filledBallotPaperDefaultVoteOption.invalid]: 0,
            },
          ],
          [
            {
              [randomUUID()]: 1,
              [filledBallotPaperDefaultVoteOption.noVote]: 0,
              [filledBallotPaperDefaultVoteOption.invalid]: 0,
            },
          ],
        ),
      );
    expect(res.statusCode).toBe(HttpStatusCode.forbidden);
    expect(res.type).toBe('application/json');
    const parseResult = response403Object.safeParse(res.body);
    expect(parseResult.success).toBe(true);
    expect(parseResult.data?.message).toBe(VoteValidationErrorMessage.electionNotVotable);
  });

  // sent ballot paper does not contain expected sections
  it('400: sent ballot paper does not contain expected sections', async () => {
    if (
      invalidAllowedElectionPubKey === null ||
      invalidAllowedBallotPaper === null ||
      invalidAllowedBallotPaperSection1 === null
    ) {
      throw new Error('Invalid allowed pubKey, ballot paper or section 1 is null');
    }

    const sectionToRemoveUuid = randomUUID();

    let tooLittleSectionsBallotPaper = createEncryptedBallotPaper(
      invalidAllowedElectionPubKey,
      invalidAllowedBallotPaper.id,
      invalidAllowedBallotPaperSection1.id,
      sectionToRemoveUuid,
      [
        {
          [randomUUID()]: 1,
          [filledBallotPaperDefaultVoteOption.noVote]: 0,
          [filledBallotPaperDefaultVoteOption.invalid]: 0,
        },
      ],
      [
        {
          [randomUUID()]: 1,
          [filledBallotPaperDefaultVoteOption.noVote]: 0,
          [filledBallotPaperDefaultVoteOption.invalid]: 0,
        },
      ],
    );

    const section1 = tooLittleSectionsBallotPaper.sections[invalidAllowedBallotPaperSection1.id];
    if (section1 === undefined) {
      throw new Error('Section 1 not found in created ballot paper');
    }
    tooLittleSectionsBallotPaper = {
      ...tooLittleSectionsBallotPaper,
      sections: {
        // remove one section
        [invalidAllowedBallotPaperSection1.id]: section1,
      },
    };

    const res = await request(app)
      .post(submitVotePath)
      .set('Authorization', `Bearer ${voterToken}`)
      .send(tooLittleSectionsBallotPaper);
    expect(res.statusCode).toBe(HttpStatusCode.badRequest);
    expect(res.type).toBe('application/json');
    const parseResult = response400Object.safeParse(res.body);
    expect(parseResult.success).toBe(true);
    expect(parseResult.data?.message).toBe(VoteValidationErrorMessage.invalidVote);
  });

  // sent section does not contain expected amount of votes
  it('400: A section does not contain expected amount of votes', async () => {
    if (
      invalidAllowedElectionPubKey === null ||
      invalidAllowedBallotPaper === null ||
      invalidAllowedBallotPaperSection1 === null ||
      invalidAllowedBallotPaperSection2 === null ||
      invalidAllowedCandidate1 === null ||
      invalidAllowedCandidate2 === null
    ) {
      throw new Error('Invalid allowed pubKey, ballot paper, sections or candidates are null');
    }

    const ballotPaper = createEncryptedBallotPaper(
      invalidAllowedElectionPubKey,
      invalidAllowedBallotPaper.id,
      invalidAllowedBallotPaperSection1.id,
      invalidAllowedBallotPaperSection2.id,
      [
        // 2 votes Candidate1, 1 vote Candidate2, 1 noVote
        {
          [invalidAllowedCandidate1.id]: 1,
          [invalidAllowedCandidate2.id]: 0,
          [filledBallotPaperDefaultVoteOption.noVote]: 0,
          [filledBallotPaperDefaultVoteOption.invalid]: 0,
        },
        {
          [invalidAllowedCandidate1.id]: 1,
          [invalidAllowedCandidate2.id]: 0,
          [filledBallotPaperDefaultVoteOption.noVote]: 0,
          [filledBallotPaperDefaultVoteOption.invalid]: 0,
        },
        {
          [invalidAllowedCandidate1.id]: 0,
          [invalidAllowedCandidate2.id]: 1,
          [filledBallotPaperDefaultVoteOption.noVote]: 0,
          [filledBallotPaperDefaultVoteOption.invalid]: 0,
        },
        {
          [invalidAllowedCandidate1.id]: 0,
          [invalidAllowedCandidate2.id]: 0,
          [filledBallotPaperDefaultVoteOption.noVote]: 1,
          [filledBallotPaperDefaultVoteOption.invalid]: 0,
        },
      ],
      [
        // only 1 vote, but 4 expected
        {
          [invalidAllowedCandidate1.id]: 0,
          [invalidAllowedCandidate2.id]: 1,
          [filledBallotPaperDefaultVoteOption.noVote]: 0,
          [filledBallotPaperDefaultVoteOption.invalid]: 0,
        },
      ],
    );

    const res = await request(app)
      .post(submitVotePath)
      .set('Authorization', `Bearer ${voterToken}`)
      .send(ballotPaper);
    expect(res.statusCode).toBe(HttpStatusCode.badRequest);
    expect(res.type).toBe('application/json');
    const parseResult = response400Object.safeParse(res.body);
    expect(parseResult.success).toBe(true);
    expect(parseResult.data?.message).toBe(VoteValidationErrorMessage.invalidVote);
  });

  // sent sections candidates are not the same across all votes - make sure the checks can deal with sparsely populated arrays

  // sent section does not contain expected candidateIds

  // sent section failed decryption

  // sent section contains invalid votes, but invalid votes are not allowed

  // sent section failed invalid vote consistency

  // sent section candidate exceeds maxVotesPerCandidate

  // sent ballot paper has invalid and valid sections

  // candidate violates maxVotesPerCandidate of ballot paper (but not of sections)

  // maxVotes of ballot paper is violated

  // valid vote

  // voter is not allowed to vote on the given ballot paper (because the ballot paper does not exist, or the voter is not assigned to the ballot paper, or the voter has already voted)
  //it('403: voter is not allowed to vote on the given ballot paper as they already voted', async () => {
  //
  //});
});
