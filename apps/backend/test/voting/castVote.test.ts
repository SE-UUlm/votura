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
import { cloneDeep } from 'lodash';
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

/**
 * Generates an array of fully-formed vote objects from a simple list of choices.
 *
 * @param allOptions An array of all possible candidate and default option IDs for a section.
 * @param choices A simple array of the IDs being voted for. The length of this array
 * determines how many vote objects are created.
 * @returns An array of vote objects ready to be used in createEncryptedBallotPaper.
 */
function generateVoteObjects(allOptions: string[], choices: string[]): Record<string, number>[] {
  return choices.map((choice) => {
    const voteObject: Record<string, number> = {};
    for (const option of allOptions) {
      voteObject[option] = option === choice ? 1 : 0;
    }
    return voteObject;
  });
}

/**
 * Generates an encryptedFilledBallotPaper filled with the information given to it.
 * It is assumed that the ballot paper has two sections.
 *
 * @param publicKey The public key of the election the ballot paper belongs to
 * @param ballotPaperId The ID of the ballot paper to encrypt
 * @param section1Id The ID of the first section of the ballot paper
 * @param section2Id The ID of the second section of the ballot paper
 * @param section1Votes An array of vote records for section 1, each only containing one chosen option
 * @param section2Votes An array of vote records for section 2, each only containing one chosen option
 * @returns An encrypted ballot paper ready to be sent to the backend
 */
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
  let invalidAllowedCandidate1: SelectableCandidate | null = null;
  let invalidAllowedCandidate2: SelectableCandidate | null = null;
  let invalidAllowedVoteOptions: string[] = [];

  let invalidForbiddenElectionPubKey: PublicKey | null = null;
  let invalidForbiddenBallotPaper: SelectableBallotPaper | null = null;
  let invalidForbiddenBallotPaperSection1: SelectableBallotPaperSection | null = null;
  let invalidForbiddenBallotPaperSection2: SelectableBallotPaperSection | null = null;
  let invalidForbiddenCandidate1: SelectableCandidate | null = null;
  let invalidForbiddenCandidate2: SelectableCandidate | null = null;
  let invalidForbiddenVoteOptions: string[] = [];

  let validEncryptedInvalidAllowedBP: EncryptedFilledBallotPaper = {
    ballotPaperId: '',
    sections: {},
  };

  beforeAll(async () => {
    await createUser(demoUser);
    const user = await findUserBy({ email: demoUser.email });
    if (user === null) {
      throw new Error('User was not created successfully in the database');
    }

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

    invalidAllowedVoteOptions = [
      invalidAllowedCandidate1.id,
      invalidAllowedCandidate2.id,
      filledBallotPaperDefaultVoteOption.noVote,
      filledBallotPaperDefaultVoteOption.invalid,
    ];
    invalidForbiddenVoteOptions = [
      invalidForbiddenCandidate1.id,
      invalidForbiddenCandidate2.id,
      filledBallotPaperDefaultVoteOption.noVote,
      filledBallotPaperDefaultVoteOption.invalid,
    ];

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

    // create valid encrypted ballot paper
    validEncryptedInvalidAllowedBP = createEncryptedBallotPaper(
      invalidAllowedElectionPubKey,
      invalidAllowedBallotPaper.id,
      invalidAllowedBallotPaperSection1.id,
      invalidAllowedBallotPaperSection2.id,
      generateVoteObjects(invalidAllowedVoteOptions, [
        // Candidate 1, 3x noVote
        invalidAllowedCandidate1.id,
        filledBallotPaperDefaultVoteOption.noVote,
        filledBallotPaperDefaultVoteOption.noVote,
        filledBallotPaperDefaultVoteOption.noVote,
      ]),
      generateVoteObjects(invalidAllowedVoteOptions, [
        // Candidate 2, 3x noVote
        invalidAllowedCandidate2.id,
        filledBallotPaperDefaultVoteOption.noVote,
        filledBallotPaperDefaultVoteOption.noVote,
        filledBallotPaperDefaultVoteOption.noVote,
      ]),
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

  // Step 1: invalid request body (does not meet schema specifications)
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

  // Step 3: election is not votable (not started yet, or already ended, not frozen)
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

  // Step 4: sent ballot paper does not contain expected sections
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

  // Step 5.1: sent section does not contain expected amount of votes
  it('400: section does not contain expected amount of votes', async () => {
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
      generateVoteObjects(invalidAllowedVoteOptions, [
        // 2 votes Candidate1, 1 vote Candidate2, 1 noVote
        invalidAllowedCandidate1.id,
        invalidAllowedCandidate1.id,
        invalidAllowedCandidate2.id,
        filledBallotPaperDefaultVoteOption.noVote,
      ]),
      generateVoteObjects(
        invalidAllowedVoteOptions,
        [invalidAllowedCandidate2.id], // only 1 vote, but 4 expected
      ),
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

  // Step 5.2: sent sections candidates are not the same across all votes
  it('400: section contains votes with different candidates', async () => {
    if (invalidAllowedBallotPaperSection1 === null || invalidAllowedCandidate2 === null) {
      throw new Error('Test setup failed');
    }

    // deeply clone as otherwise the changes in validEncryptedBallotPaper would persist
    const ballotPaper = cloneDeep(validEncryptedInvalidAllowedBP);

    // remove candidate 2 from section 1 vote 1
    const section1 = ballotPaper.sections[invalidAllowedBallotPaperSection1.id];
    if (section1 === undefined) {
      throw new Error('Test setup failed');
    }
    const vote1 = section1.votes[0];
    if (vote1 === undefined) {
      throw new Error('Test setup failed');
    }
    delete vote1[invalidAllowedCandidate2.id];

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

  // Step 5.3: sent section does not contain expected candidateIds
  it('400: section does not contain the expected candidate IDs', async () => {
    if (
      invalidAllowedElectionPubKey === null ||
      invalidAllowedBallotPaper === null ||
      invalidAllowedBallotPaperSection1 === null ||
      invalidAllowedBallotPaperSection2 === null
    ) {
      throw new Error('Test setup failed');
    }

    // candidates are the same across all votes but Ids are not the ones linked to the sections
    const randomCandidate1 = randomUUID();
    const randomCandidate2 = randomUUID();
    const ballotPaperCandidates = [
      randomCandidate1,
      randomCandidate2,
      filledBallotPaperDefaultVoteOption.noVote,
      filledBallotPaperDefaultVoteOption.invalid,
    ];

    const ballotPaper = createEncryptedBallotPaper(
      invalidAllowedElectionPubKey,
      invalidAllowedBallotPaper.id,
      invalidAllowedBallotPaperSection1.id,
      invalidAllowedBallotPaperSection2.id,
      generateVoteObjects(ballotPaperCandidates, [
        // random Candidate 1, 3x noVote
        randomCandidate1,
        filledBallotPaperDefaultVoteOption.noVote,
        filledBallotPaperDefaultVoteOption.noVote,
        filledBallotPaperDefaultVoteOption.noVote,
      ]),
      generateVoteObjects(ballotPaperCandidates, [
        // random Candidate 2, 3x noVote
        randomCandidate2,
        filledBallotPaperDefaultVoteOption.noVote,
        filledBallotPaperDefaultVoteOption.noVote,
        filledBallotPaperDefaultVoteOption.noVote,
      ]),
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

  // Step 6.1: sent section failed decryption
  it('400: section failed decryption', async () => {
    if (invalidAllowedBallotPaperSection1 === null || invalidAllowedCandidate1 === null) {
      throw new Error('Test setup failed');
    }

    // deeply clone as otherwise the changes would persist in validEncryptedBallotPaper
    const ballotPaper = cloneDeep(validEncryptedInvalidAllowedBP);

    // Tamper with the ciphertext to cause a decryption failure
    const section1 = ballotPaper.sections[invalidAllowedBallotPaperSection1.id];
    if (section1 === undefined) {
      throw new Error('Test setup failed');
    }
    const vote = section1.votes[0];
    if (vote === undefined) {
      throw new Error('Test setup failed');
    }
    const candidateVote = vote[invalidAllowedCandidate1.id];
    if (candidateVote === undefined) {
      throw new Error('Test setup failed');
    }
    candidateVote.alpha = '1345654';

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

  // Step 6.2: sent section contains invalid votes, but invalid votes are not allowed
  it('400: section contains invalid votes, but invalid votes are not allowed', async () => {
    if (
      invalidForbiddenElectionPubKey === null ||
      invalidForbiddenBallotPaper === null ||
      invalidForbiddenBallotPaperSection1 === null ||
      invalidForbiddenBallotPaperSection2 === null ||
      invalidForbiddenCandidate1 === null ||
      invalidForbiddenCandidate2 === null
    ) {
      throw new Error('Test setup failed');
    }

    const ballotPaper = createEncryptedBallotPaper(
      invalidForbiddenElectionPubKey,
      invalidForbiddenBallotPaper.id,
      invalidForbiddenBallotPaperSection1.id,
      invalidForbiddenBallotPaperSection2.id,
      generateVoteObjects(invalidForbiddenVoteOptions, [
        // Candidate 1 x2, Candidate 2 x1, invalid
        invalidForbiddenCandidate1.id,
        invalidForbiddenCandidate1.id,
        invalidForbiddenCandidate2.id,
        filledBallotPaperDefaultVoteOption.invalid,
      ]),
      generateVoteObjects(invalidForbiddenVoteOptions, [
        // Candidate 2, noVote x2, invalid
        invalidForbiddenCandidate2.id,
        filledBallotPaperDefaultVoteOption.noVote,
        filledBallotPaperDefaultVoteOption.invalid,
        filledBallotPaperDefaultVoteOption.noVote,
      ]),
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

  // Step 6.3: sent section failed invalid vote consistency
  it('400: section failed invalid vote consistency check', async () => {
    if (
      invalidAllowedElectionPubKey === null ||
      invalidAllowedBallotPaper === null ||
      invalidAllowedBallotPaperSection1 === null ||
      invalidAllowedBallotPaperSection2 === null ||
      invalidAllowedCandidate1 === null ||
      invalidAllowedCandidate2 === null
    ) {
      throw new Error('Test setup failed');
    }

    const ballotPaper = createEncryptedBallotPaper(
      invalidAllowedElectionPubKey,
      invalidAllowedBallotPaper.id,
      invalidAllowedBallotPaperSection1.id,
      invalidAllowedBallotPaperSection2.id,
      generateVoteObjects(invalidAllowedVoteOptions, [
        // all valid
        invalidAllowedCandidate1.id,
        invalidAllowedCandidate2.id,
        filledBallotPaperDefaultVoteOption.noVote,
        filledBallotPaperDefaultVoteOption.noVote,
      ]),
      generateVoteObjects(invalidAllowedVoteOptions, [
        // 1x invalid, rest valid
        invalidAllowedCandidate1.id,
        filledBallotPaperDefaultVoteOption.invalid,
        filledBallotPaperDefaultVoteOption.noVote,
        filledBallotPaperDefaultVoteOption.noVote,
      ]),
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

  // Step 6.4: sent section candidate exceeds maxVotesPerCandidate
  it('400: A section candidate exceeds maxVotesPerCandidate', async () => {
    if (
      invalidAllowedElectionPubKey === null ||
      invalidAllowedBallotPaper === null ||
      invalidAllowedBallotPaperSection1 === null ||
      invalidAllowedBallotPaperSection2 === null ||
      invalidAllowedCandidate1 === null ||
      invalidAllowedCandidate2 === null
    ) {
      throw new Error('Test setup failed');
    }

    const ballotPaper = createEncryptedBallotPaper(
      invalidAllowedElectionPubKey,
      invalidAllowedBallotPaper.id,
      invalidAllowedBallotPaperSection1.id,
      invalidAllowedBallotPaperSection2.id,
      generateVoteObjects(invalidAllowedVoteOptions, [
        // 3 votes for candidate 1, 2 are allowed
        invalidAllowedCandidate1.id,
        invalidAllowedCandidate1.id,
        invalidAllowedCandidate1.id,
        filledBallotPaperDefaultVoteOption.noVote,
      ]),
      generateVoteObjects(invalidAllowedVoteOptions, [
        // valid section
        invalidAllowedCandidate2.id,
        filledBallotPaperDefaultVoteOption.noVote,
        filledBallotPaperDefaultVoteOption.noVote,
        filledBallotPaperDefaultVoteOption.noVote,
      ]),
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

  // Step 7.1: sent ballot paper has invalid and valid sections
  it('400: Ballot paper has invalid and valid sections', async () => {
    if (
      invalidAllowedElectionPubKey === null ||
      invalidAllowedBallotPaper === null ||
      invalidAllowedBallotPaperSection1 === null ||
      invalidAllowedBallotPaperSection2 === null ||
      invalidAllowedCandidate1 === null ||
      invalidAllowedCandidate2 === null
    ) {
      throw new Error('Test setup failed');
    }

    const ballotPaper = createEncryptedBallotPaper(
      invalidAllowedElectionPubKey,
      invalidAllowedBallotPaper.id,
      invalidAllowedBallotPaperSection1.id,
      invalidAllowedBallotPaperSection2.id,
      generateVoteObjects(invalidAllowedVoteOptions, [
        // 4x invalid
        filledBallotPaperDefaultVoteOption.invalid,
        filledBallotPaperDefaultVoteOption.invalid,
        filledBallotPaperDefaultVoteOption.invalid,
        filledBallotPaperDefaultVoteOption.invalid,
      ]),
      generateVoteObjects(invalidAllowedVoteOptions, [
        // valid section
        invalidAllowedCandidate2.id,
        invalidAllowedCandidate1.id,
        filledBallotPaperDefaultVoteOption.noVote,
        filledBallotPaperDefaultVoteOption.noVote,
      ]),
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

  // Step 7.2: candidate violates maxVotesPerCandidate of ballot paper (but not of sections)
  it('400: Candidate violates maxVotesPerCandidate of ballot paper', async () => {
    if (
      invalidAllowedElectionPubKey === null ||
      invalidAllowedBallotPaper === null ||
      invalidAllowedBallotPaperSection1 === null ||
      invalidAllowedBallotPaperSection2 === null ||
      invalidAllowedCandidate1 === null ||
      invalidAllowedCandidate2 === null
    ) {
      throw new Error('Test setup failed');
    }

    // maxVotesPerCandidate is 3 for the ballot paper
    const ballotPaper = createEncryptedBallotPaper(
      invalidAllowedElectionPubKey,
      invalidAllowedBallotPaper.id,
      invalidAllowedBallotPaperSection1.id,
      invalidAllowedBallotPaperSection2.id,
      generateVoteObjects(invalidAllowedVoteOptions, [
        // 2x Candidate 1, 2x noVote
        invalidAllowedCandidate1.id,
        invalidAllowedCandidate1.id,
        filledBallotPaperDefaultVoteOption.noVote,
        filledBallotPaperDefaultVoteOption.noVote,
      ]),
      generateVoteObjects(invalidAllowedVoteOptions, [
        // 2x Candidate 1, 2x noVote
        invalidAllowedCandidate1.id,
        invalidAllowedCandidate1.id,
        filledBallotPaperDefaultVoteOption.noVote,
        filledBallotPaperDefaultVoteOption.noVote,
      ]),
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

  // Step 7.3: maxVotes of ballot paper is violated
  it('400: maxVotes of ballot paper is violated', async () => {
    if (
      invalidAllowedElectionPubKey === null ||
      invalidAllowedBallotPaper === null ||
      invalidAllowedBallotPaperSection1 === null ||
      invalidAllowedBallotPaperSection2 === null ||
      invalidAllowedCandidate1 === null ||
      invalidAllowedCandidate2 === null
    ) {
      throw new Error('Test setup failed');
    }

    // 5 votes are allowed, 6 submitted
    const ballotPaper = createEncryptedBallotPaper(
      invalidAllowedElectionPubKey,
      invalidAllowedBallotPaper.id,
      invalidAllowedBallotPaperSection1.id,
      invalidAllowedBallotPaperSection2.id,
      generateVoteObjects(invalidAllowedVoteOptions, [
        // Candidate 1, 2x Candidate 2, noVote
        invalidAllowedCandidate1.id,
        invalidAllowedCandidate2.id,
        invalidAllowedCandidate2.id,
        filledBallotPaperDefaultVoteOption.noVote,
      ]),
      generateVoteObjects(invalidAllowedVoteOptions, [
        // 2x Candidate 1, Candidate 2, noVote
        invalidAllowedCandidate1.id,
        invalidAllowedCandidate1.id,
        invalidAllowedCandidate2.id,
        filledBallotPaperDefaultVoteOption.noVote,
      ]),
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

  // valid vote
  it('204: valid vote is cast successfully', async () => {
    if (
      invalidForbiddenElectionPubKey === null ||
      invalidForbiddenBallotPaper === null ||
      invalidForbiddenBallotPaperSection1 === null ||
      invalidForbiddenBallotPaperSection2 === null ||
      invalidForbiddenCandidate1 === null ||
      invalidForbiddenCandidate2 === null
    ) {
      throw new Error('Test setup failed');
    }

    const ballotPaper = createEncryptedBallotPaper(
      invalidForbiddenElectionPubKey,
      invalidForbiddenBallotPaper.id,
      invalidForbiddenBallotPaperSection1.id,
      invalidForbiddenBallotPaperSection2.id,
      generateVoteObjects(invalidForbiddenVoteOptions, [
        // Candidate 1, 3x noVote
        invalidForbiddenCandidate1.id,
        filledBallotPaperDefaultVoteOption.noVote,
        filledBallotPaperDefaultVoteOption.noVote,
        filledBallotPaperDefaultVoteOption.noVote,
      ]),
      generateVoteObjects(invalidForbiddenVoteOptions, [
        // Candidate 2, 3x noVote
        invalidForbiddenCandidate2.id,
        filledBallotPaperDefaultVoteOption.noVote,
        filledBallotPaperDefaultVoteOption.noVote,
        filledBallotPaperDefaultVoteOption.noVote,
      ]),
    );

    const res = await request(app)
      .post(submitVotePath)
      .set('Authorization', `Bearer ${voterToken}`)
      .send(ballotPaper);

    expect(res.statusCode).toBe(HttpStatusCode.noContent);
  });

  // Step 2: voter is not allowed to vote on the given ballot paper (because the ballot paper does not exist, or the voter is not assigned to the ballot paper, or the voter has already voted)
  it('403: voter is not allowed to vote on the given ballot paper as they already voted', async () => {
    if (
      invalidAllowedElectionPubKey === null ||
      invalidAllowedBallotPaper === null ||
      invalidAllowedBallotPaperSection1 === null ||
      invalidAllowedBallotPaperSection2 === null ||
      invalidAllowedCandidate1 === null ||
      invalidAllowedCandidate2 === null
    ) {
      throw new Error('Test setup failed');
    }

    const ballotPaper = validEncryptedInvalidAllowedBP;

    // First vote
    const res1 = await request(app)
      .post(submitVotePath)
      .set('Authorization', `Bearer ${voterToken}`)
      .send(ballotPaper);
    expect(res1.statusCode).toBe(HttpStatusCode.noContent);

    // Second vote
    const res2 = await request(app)
      .post(submitVotePath)
      .set('Authorization', `Bearer ${voterToken}`)
      .send(ballotPaper);
    expect(res2.statusCode).toBe(HttpStatusCode.forbidden);
    expect(res2.type).toBe('application/json');
    const parseResult = response403Object.safeParse(res2.body);
    expect(parseResult.success).toBe(true);
    expect(parseResult.data?.message).toBe(VoteValidationErrorMessage.notAllowedToVote);
  });
});
