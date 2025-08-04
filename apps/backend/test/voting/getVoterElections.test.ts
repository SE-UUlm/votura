/*
// positive test for getVoterElections
Create 2 valid elections, each with 2 ballot papers, each with 2 sections, each section with 2 candidates. -> 8 Candidates in total to make sections unique based on candidates
Create voter group with 1 voter for both elections, getting a ballot paper for each election 

Freeze election

Generate voter tokens for voter group

get voter elections for vote

make request with authenticated voter token as bearer token

Make sure everything is as expected

// negative test:
use invalid voter token 
*/

import {
  response401Object,
  selectableElectionObject,
  selectableVotingElectionObject,
  type ApiTokenUser,
  type SelectableBallotPaper,
  type SelectableBallotPaperSection,
  type SelectableCandidate,
  type SelectableElection,
} from '@repo/votura-validators';
import { randomUUID } from 'crypto';
import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';
import { app } from '../../src/app.js';
import { generateUserTokens } from '../../src/auth/utils.js';
import { HttpStatusCode } from '../../src/httpStatusCode.js';
import { VoterAuthErrorMessages } from '../../src/middlewares/auth.js';
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
  voterGroupNoBallotPapers,
} from '../mockData.js';
import { sleep } from '../utils.js';

enum Election1Names {
  electionName = 'Election 1',
  ballotPaper1Name = 'Election 1 First Ballot Paper',
  ballotPaper2Name = 'Election 1 Second Ballot Paper',
  section1Name = 'Election 1 First Section',
  section2Name = 'Election 1 Second Section',
  section3Name = 'Election 1 Third Section',
  section4Name = 'Election 1 Fourth Section',
  candidate1Title = 'Election 1 First Candidate',
  candidate2Title = 'Election 1 Second Candidate',
  candidate3Title = 'Election 1 Third Candidate',
  candidate4Title = 'Election 1 Fourth Candidate',
}

enum Election2Names {
  electionName = 'Election 2',
  ballotPaper1Name = 'Election 2 First Ballot Paper',
  ballotPaper2Name = 'Election 2 Second Ballot Paper',
  section1Name = 'Election 2 First Section',
  section2Name = 'Election 2 Second Section',
  section3Name = 'Election 2 Third Section',
  section4Name = 'Election 2 Fourth Section',
  candidate1Title = 'Election 2 First Candidate',
  candidate2Title = 'Election 2 Second Candidate',
  candidate3Title = 'Election 2 Third Candidate',
  candidate4Title = 'Election 2 Fourth Candidate',
}

describe(`GET /voting/getElections`, () => {
  const getElectionsPath = '/voting/getElections';
  let generateVoterTokensPath = '';
  let userTokens: ApiTokenUser = { accessToken: '', refreshToken: '' };

  let election1: SelectableElection | null = null;
  let ballotPaper11: SelectableBallotPaper | null = null;
  let section11: SelectableBallotPaperSection | null = null;
  let section12: SelectableBallotPaperSection | null = null;
  let candidate11: SelectableCandidate | null = null;
  let candidate12: SelectableCandidate | null = null;
  let candidate13: SelectableCandidate | null = null;

  let election2: SelectableElection | null = null;
  let ballotPaper21: SelectableBallotPaper | null = null;
  let section21: SelectableBallotPaperSection | null = null;
  let section22: SelectableBallotPaperSection | null = null;
  let candidate21: SelectableCandidate | null = null;
  let candidate22: SelectableCandidate | null = null;
  let candidate23: SelectableCandidate | null = null;

  beforeAll(async () => {
    await createUser(demoUser);
    const user = await findUserBy({ email: demoUser.email });
    if (user === null) {
      throw new Error('Failed to find test user');
    }

    // Create two elections with ballot papers, sections, and candidates
    // Each election has two ballot papers, each ballot paper has two sections, and each section has two candidates, with no section sharing the same combination of candidates
    // This is to ensure that getting the elections for a voter works correctly with multiple ballot papers, sections and candidates
    election1 = await createElection(
      { ...demoElection, name: Election1Names.electionName },
      user.id,
    );
    ballotPaper11 = await createBallotPaper(
      { ...demoBallotPaper, name: Election1Names.ballotPaper1Name },
      election1.id,
    );
    const ballotPaper12 = await createBallotPaper(
      { ...demoBallotPaper, name: Election1Names.ballotPaper2Name },
      election1.id,
    );
    section11 = await createBallotPaperSection(
      { ...demoBallotPaperSection, name: Election1Names.section1Name },
      ballotPaper11.id,
    );
    section12 = await createBallotPaperSection(
      { ...demoBallotPaperSection, name: Election1Names.section2Name },
      ballotPaper11.id,
    );
    const section13 = await createBallotPaperSection(
      { ...demoBallotPaperSection, name: Election1Names.section3Name },
      ballotPaper12.id,
    );
    const section14 = await createBallotPaperSection(
      { ...demoBallotPaperSection, name: Election1Names.section4Name },
      ballotPaper12.id,
    );
    candidate11 = await createCandidate(
      { ...demoCandidate, title: Election1Names.candidate1Title },
      election1.id,
    );
    candidate12 = await createCandidate(
      { ...demoCandidate, title: Election1Names.candidate2Title },
      election1.id,
    );
    candidate13 = await createCandidate(
      { ...demoCandidate, title: Election1Names.candidate3Title },
      election1.id,
    );
    const candidate14 = await createCandidate(
      { ...demoCandidate, title: Election1Names.candidate4Title },
      election1.id,
    );
    await addCandidateToBallotPaperSection(section11.id, candidate11.id);
    await addCandidateToBallotPaperSection(section11.id, candidate12.id);
    await addCandidateToBallotPaperSection(section12.id, candidate11.id);
    await addCandidateToBallotPaperSection(section12.id, candidate13.id);
    await addCandidateToBallotPaperSection(section13.id, candidate11.id);
    await addCandidateToBallotPaperSection(section13.id, candidate14.id);
    await addCandidateToBallotPaperSection(section14.id, candidate12.id);
    await addCandidateToBallotPaperSection(section14.id, candidate13.id);

    election2 = await createElection(
      { ...demoElection, name: Election2Names.electionName },
      user.id,
    );
    ballotPaper21 = await createBallotPaper(
      { ...demoBallotPaper, name: Election2Names.ballotPaper1Name },
      election2.id,
    );
    const ballotPaper22 = await createBallotPaper(
      { ...demoBallotPaper, name: Election2Names.ballotPaper2Name },
      election2.id,
    );
    section21 = await createBallotPaperSection(
      { ...demoBallotPaperSection, name: Election2Names.section1Name },
      ballotPaper21.id,
    );
    section22 = await createBallotPaperSection(
      { ...demoBallotPaperSection, name: Election2Names.section2Name },
      ballotPaper21.id,
    );
    const section23 = await createBallotPaperSection(
      { ...demoBallotPaperSection, name: Election2Names.section3Name },
      ballotPaper22.id,
    );
    const section24 = await createBallotPaperSection(
      { ...demoBallotPaperSection, name: Election2Names.section4Name },
      ballotPaper22.id,
    );
    candidate21 = await createCandidate(
      { ...demoCandidate, title: Election2Names.candidate1Title },
      election2.id,
    );
    candidate22 = await createCandidate(
      { ...demoCandidate, title: Election2Names.candidate2Title },
      election2.id,
    );
    candidate23 = await createCandidate(
      { ...demoCandidate, title: Election2Names.candidate3Title },
      election2.id,
    );
    const candidate24 = await createCandidate(
      { ...demoCandidate, title: Election2Names.candidate4Title },
      election2.id,
    );
    await addCandidateToBallotPaperSection(section21.id, candidate21.id);
    await addCandidateToBallotPaperSection(section21.id, candidate22.id);
    await addCandidateToBallotPaperSection(section22.id, candidate21.id);
    await addCandidateToBallotPaperSection(section22.id, candidate23.id);
    await addCandidateToBallotPaperSection(section23.id, candidate21.id);
    await addCandidateToBallotPaperSection(section23.id, candidate24.id);
    await addCandidateToBallotPaperSection(section24.id, candidate22.id);
    await addCandidateToBallotPaperSection(section24.id, candidate23.id);

    // Create a voter group consisting of 1 voter that is eligible to vote in all elections
    const voterGroup = await createVoterGroup(
      {
        ...voterGroupNoBallotPapers,
        numberOfVoters: 1,
        ballotPapers: [ballotPaper11.id, ballotPaper21.id],
      },
      user.id,
    );

    // Generate tokens for the user
    userTokens = generateUserTokens(user.id);

    // freeze both elections
    let res1 = await request(app)
      .put(`/elections/${election1.id}/freeze`)
      .set('Authorization', `Bearer ${userTokens.accessToken}`);
    let parseResult1 = selectableElectionObject.safeParse(res1.body);
    if (!parseResult1.success) {
      throw new Error('Failed to parse election 1');
    }

    let res2 = await request(app)
      .put(`/elections/${election2.id}/freeze`)
      .set('Authorization', `Bearer ${userTokens.accessToken}`);
    let parseResult2 = selectableElectionObject.safeParse(res2.body);
    if (!parseResult2.success) {
      throw new Error('Failed to parse election 2');
    }

    // wait for the cryptographic keys of the elections to be generated
    while (parseResult1.data.pubKey === undefined || parseResult2.data.pubKey === undefined) {
      await sleep(5000);

      res1 = await request(app)
        .get(`/elections/${election1?.id}`)
        .set('Authorization', `Bearer ${userTokens.accessToken}`);
      parseResult1 = selectableElectionObject.safeParse(res1.body);
      if (!parseResult1.success) {
        throw new Error('Failed to parse election 1');
      }

      res2 = await request(app)
        .get(`/elections/${election2?.id}`)
        .set('Authorization', `Bearer ${userTokens.accessToken}`);
      parseResult2 = selectableElectionObject.safeParse(res2.body);
      if (!parseResult2.success) {
        throw new Error('Failed to parse election 2');
      }
    }
    election1 = parseResult1.data;
    election2 = parseResult2.data;

    generateVoterTokensPath = `/voterGroups/${voterGroup.id}/createVoterTokens`;
  }, 30000 /* 30 seconds timeout*/);

  // TODO: Extend the tests to add a case where the voter has already voted on an election -> this election should not be returned

  it('200: should return both elections with the ballot paper etc. the voter is eligible to vote in', async () => {
    // Generate voter tokens for the voter group
    const voterTokens = await request(app)
      .get(generateVoterTokensPath)
      .set('Authorization', `Bearer ${userTokens.accessToken}`);
    expect(voterTokens.statusCode).toBe(HttpStatusCode.ok);
    const voterToken = (voterTokens.body as string[])[0];
    if (voterToken === undefined) {
      throw new Error('No voter token returned');
    }

    const voterElections = await request(app)
      .get(getElectionsPath)
      .set('Authorization', `Bearer ${voterToken}`);
    expect(voterElections.statusCode).toBe(HttpStatusCode.ok);
    expect(voterElections.type).toBe('application/json');
    expect(Array.isArray(voterElections.body)).toBe(true);
    expect((voterElections.body as unknown[]).length).toBe(2); // 2 elections should be returned
    const parseResult = selectableVotingElectionObject.array().safeParse(voterElections.body);
    if (!parseResult.success) {
      throw new Error('Failed to parse voter elections');
    }
    const elections = parseResult.data;

    // find out which election in the returned array is election1 and which is election2
    const election1Index = elections.findIndex((election) => election.id === election1?.id);
    const election2Index = elections.findIndex((election) => election.id === election2?.id);

    // Check the first election
    const returnedElection1 = elections[election1Index];
    if (returnedElection1 === undefined) {
      throw new Error('No first election returned');
    }
    expect(returnedElection1.id).toBe(election1?.id);
    expect(returnedElection1.name).toBe(Election1Names.electionName);
    expect(returnedElection1.description).toBe(demoElection.description);
    expect(returnedElection1.private).toBe(demoElection.private);
    expect(returnedElection1.votingStartAt).toBe(election1?.votingStartAt);
    expect(returnedElection1.votingEndAt).toBe(election1?.votingEndAt);
    expect(returnedElection1.allowInvalidVotes).toBe(demoElection.allowInvalidVotes);
    expect(returnedElection1.configFrozen).toBe(true);
    expect(returnedElection1.pubKey).toBeDefined();
    expect(returnedElection1.primeP).toBeDefined();
    expect(returnedElection1.primeQ).toBeDefined();
    expect(returnedElection1.generator).toBeDefined();
    // Check the ballot paper of the first election
    const returnedBallotPaper11 = returnedElection1.ballotPaper;
    expect(returnedBallotPaper11.id).toBe(ballotPaper11?.id);
    expect(returnedBallotPaper11.name).toBe(Election1Names.ballotPaper1Name);
    expect(returnedBallotPaper11.description).toBe(demoBallotPaper.description);
    expect(returnedBallotPaper11.maxVotes).toBe(demoBallotPaper.maxVotes);
    expect(returnedBallotPaper11.maxVotesPerCandidate).toBe(demoBallotPaper.maxVotesPerCandidate);
    expect(returnedBallotPaper11.ballotPaperSections.length).toBe(2); // 2 sections should be returned
    // find out which section in the returned array is section11 and which is section12
    const section11Index = returnedBallotPaper11.ballotPaperSections.findIndex(
      (section) => section.id === section11?.id,
    );
    const section12Index = returnedBallotPaper11.ballotPaperSections.findIndex(
      (section) => section.id === section12?.id,
    );

    // Check the first section of the ballot paper
    const returnedSection11 = returnedBallotPaper11.ballotPaperSections[section11Index];
    if (returnedSection11 === undefined) {
      throw new Error('No first ballot paper section returned');
    }
    expect(returnedSection11.id).toBe(section11?.id);
    expect(returnedSection11.name).toBe(Election1Names.section1Name);
    expect(returnedSection11.description).toBe(demoBallotPaperSection.description);
    expect(returnedSection11.maxVotes).toBe(demoBallotPaperSection.maxVotes);
    expect(returnedSection11.maxVotesPerCandidate).toBe(
      demoBallotPaperSection.maxVotesPerCandidate,
    );
    expect(returnedSection11.candidates.length).toBe(2); // 2 candidates should be returned
    // find out which candidate in the returned array is candidate11 and which is candidate12
    const candidate11Index = returnedSection11.candidates.findIndex(
      (candidate) => candidate.id === candidate11?.id,
    );
    const candidate12Index = returnedSection11.candidates.findIndex(
      (candidate) => candidate.id === candidate12?.id,
    );

    // Check the first candidate of the first section
    const returnedCandidate11 = returnedSection11.candidates[candidate11Index];
    if (returnedCandidate11 === undefined) {
      throw new Error('No first candidate returned in first section');
    }
    expect(returnedCandidate11.id).toBe(candidate11?.id);
    expect(returnedCandidate11.title).toBe(Election1Names.candidate1Title);
    expect(returnedCandidate11.description).toBe(demoCandidate.description);
    // Check the second candidate of the first section
    const returnedCandidate12 = returnedSection11.candidates[candidate12Index];
    if (returnedCandidate12 === undefined) {
      throw new Error('No second candidate returned in first section');
    }
    expect(returnedCandidate12.id).toBe(candidate12?.id);
    expect(returnedCandidate12.title).toBe(Election1Names.candidate2Title);
    expect(returnedCandidate12.description).toBe(demoCandidate.description);
    // Check the second section of the ballot paper
    const returnedSection12 = returnedBallotPaper11.ballotPaperSections[section12Index];
    if (returnedSection12 === undefined) {
      throw new Error('No second ballot paper section returned');
    }
    expect(returnedSection12.id).toBe(section12?.id);
    expect(returnedSection12.name).toBe(Election1Names.section2Name);
    expect(returnedSection12.description).toBe(demoBallotPaperSection.description);
    expect(returnedSection12.maxVotes).toBe(demoBallotPaperSection.maxVotes);
    expect(returnedSection12.maxVotesPerCandidate).toBe(
      demoBallotPaperSection.maxVotesPerCandidate,
    );
    expect(returnedSection12.candidates.length).toBe(2); // 2 candidates should be returned
    // find out which candidate in the returned array is candidate11 and which is candidate13
    const candidate11Index2 = returnedSection12.candidates.findIndex(
      (candidate) => candidate.id === candidate11?.id,
    );
    const candidate13Index = returnedSection12.candidates.findIndex(
      (candidate) => candidate.id === candidate13?.id,
    );

    // Check the first candidate of the second section
    const returnedCandidate11sec2 = returnedSection12.candidates[candidate11Index2];
    if (returnedCandidate11sec2 === undefined) {
      throw new Error('No first candidate returned in second section');
    }
    expect(returnedCandidate11sec2.id).toBe(candidate11?.id);
    expect(returnedCandidate11sec2.title).toBe(Election1Names.candidate1Title);
    expect(returnedCandidate11sec2.description).toBe(demoCandidate.description);
    // Check the second candidate of the second section
    const returnedCandidate13 = returnedSection12.candidates[candidate13Index];
    if (returnedCandidate13 === undefined) {
      throw new Error('No second candidate returned in second section');
    }
    expect(returnedCandidate13.id).toBe(candidate13?.id);
    expect(returnedCandidate13.title).toBe(Election1Names.candidate3Title);
    expect(returnedCandidate13.description).toBe(demoCandidate.description);

    // Check the second election
    const returnedElection2 = elections[election2Index];
    if (returnedElection2 === undefined) {
      throw new Error('No second election returned');
    }
    expect(returnedElection2.id).toBe(election2?.id);
    expect(returnedElection2.name).toBe(Election2Names.electionName);
    expect(returnedElection2.description).toBe(demoElection.description);
    expect(returnedElection2.private).toBe(demoElection.private);
    expect(returnedElection2.votingStartAt).toBe(election2?.votingStartAt);
    expect(returnedElection2.votingEndAt).toBe(election2?.votingEndAt);
    expect(returnedElection2.allowInvalidVotes).toBe(demoElection.allowInvalidVotes);
    expect(returnedElection2.configFrozen).toBe(true);
    expect(returnedElection2.pubKey).toBeDefined();
    expect(returnedElection2.primeP).toBeDefined();
    expect(returnedElection2.primeQ).toBeDefined();
    expect(returnedElection2.generator).toBeDefined();
    // Check the ballot paper of the second election
    const returnedBallotPaper21 = returnedElection2.ballotPaper;
    expect(returnedBallotPaper21.id).toBe(ballotPaper21?.id);
    expect(returnedBallotPaper21.name).toBe(Election2Names.ballotPaper1Name);
    expect(returnedBallotPaper21.description).toBe(demoBallotPaper.description);
    expect(returnedBallotPaper21.maxVotes).toBe(demoBallotPaper.maxVotes);
    expect(returnedBallotPaper21.maxVotesPerCandidate).toBe(demoBallotPaper.maxVotesPerCandidate);
    expect(returnedBallotPaper21.ballotPaperSections.length).toBe(2); // 2 sections should be returned
    // find out which section in the returned array is section21 and which is section22
    const section21Index = returnedBallotPaper21.ballotPaperSections.findIndex(
      (section) => section.id === section21?.id,
    );
    const section22Index = returnedBallotPaper21.ballotPaperSections.findIndex(
      (section) => section.id === section22?.id,
    );
    // Check the first section of the ballot paper
    const returnedSection21 = returnedBallotPaper21.ballotPaperSections[section21Index];
    if (returnedSection21 === undefined) {
      throw new Error('No first ballot paper section returned in second election');
    }
    expect(returnedSection21.id).toBe(section21?.id);
    expect(returnedSection21.name).toBe(Election2Names.section1Name);
    expect(returnedSection21.description).toBe(demoBallotPaperSection.description);
    expect(returnedSection21.maxVotes).toBe(demoBallotPaperSection.maxVotes);
    expect(returnedSection21.maxVotesPerCandidate).toBe(
      demoBallotPaperSection.maxVotesPerCandidate,
    );
    expect(returnedSection21.candidates.length).toBe(2); // 2 candidates should be returned
    // find out which candidate in the returned array is candidate21 and which is candidate22
    const candidate21Index = returnedSection21.candidates.findIndex(
      (candidate) => candidate.id === candidate21?.id,
    );
    const candidate22Index = returnedSection21.candidates.findIndex(
      (candidate) => candidate.id === candidate22?.id,
    );
    // Check the first candidate of the first section
    const returnedCandidate21 = returnedSection21.candidates[candidate21Index];
    if (returnedCandidate21 === undefined) {
      throw new Error('No first candidate returned in first section of second election');
    }
    expect(returnedCandidate21.id).toBe(candidate21?.id);
    expect(returnedCandidate21.title).toBe(Election2Names.candidate1Title);
    expect(returnedCandidate21.description).toBe(demoCandidate.description);
    // Check the second candidate of the first section
    const returnedCandidate22 = returnedSection21.candidates[candidate22Index];
    if (returnedCandidate22 === undefined) {
      throw new Error('No second candidate returned in first section of second election');
    }
    expect(returnedCandidate22.id).toBe(candidate22?.id);
    expect(returnedCandidate22.title).toBe(Election2Names.candidate2Title);
    expect(returnedCandidate22.description).toBe(demoCandidate.description);
    // Check the second section of the ballot paper
    const returnedSection22 = returnedBallotPaper21.ballotPaperSections[section22Index];
    if (returnedSection22 === undefined) {
      throw new Error('No second ballot paper section returned in second election');
    }
    expect(returnedSection22.id).toBe(section22?.id);
    expect(returnedSection22.name).toBe(Election2Names.section2Name);
    expect(returnedSection22.description).toBe(demoBallotPaperSection.description);
    expect(returnedSection22.maxVotes).toBe(demoBallotPaperSection.maxVotes);
    expect(returnedSection22.maxVotesPerCandidate).toBe(
      demoBallotPaperSection.maxVotesPerCandidate,
    );
    expect(returnedSection22.candidates.length).toBe(2); // 2 candidates should be returned
    // find out which candidate in the returned array is candidate21 and which is candidate23
    const candidate21Index2 = returnedSection22.candidates.findIndex(
      (candidate) => candidate.id === candidate21?.id,
    );
    const candidate23Index = returnedSection22.candidates.findIndex(
      (candidate) => candidate.id === candidate23?.id,
    );
    // Check the first candidate of the second section
    const returnedCandidate21sec2 = returnedSection22.candidates[candidate21Index2];
    if (returnedCandidate21sec2 === undefined) {
      throw new Error('No first candidate returned in second section of second election');
    }
    expect(returnedCandidate21sec2.id).toBe(candidate21?.id);
    expect(returnedCandidate21sec2.title).toBe(Election2Names.candidate1Title);
    expect(returnedCandidate21sec2.description).toBe(demoCandidate.description);
    // Check the second candidate of the second section
    const returnedCandidate23 = returnedSection22.candidates[candidate23Index];
    if (returnedCandidate23 === undefined) {
      throw new Error('No second candidate returned in second section of second election');
    }
    expect(returnedCandidate23.id).toBe(candidate23?.id);
    expect(returnedCandidate23.title).toBe(Election2Names.candidate3Title);
    expect(returnedCandidate23.description).toBe(demoCandidate.description);
  });

  it('401: should return error if no voter token is provided', async () => {
    const voterElections = await request(app).get(getElectionsPath);

    expect(voterElections.status).toBe(401);
    expect(voterElections.type).toBe('application/json');
    const parseResult = response401Object.safeParse(voterElections.body);
    if (!parseResult.success) {
      throw new Error('Failed to parse voter elections error response');
    }
    expect(parseResult.data.message).toBe(VoterAuthErrorMessages.noToken);
  });

  it('401: should return error if the voter token is invalid', async () => {
    const invalidToken = randomUUID();

    const voterElections = await request(app)
      .get(getElectionsPath)
      .set('Authorization', `Bearer ${invalidToken}`);

    expect(voterElections.status).toBe(401);
    expect(voterElections.type).toBe('application/json');
    const parseResult = response401Object.safeParse(voterElections.body);
    if (!parseResult.success) {
      throw new Error('Failed to parse voter elections error response');
    }
    expect(parseResult.data.message).toBe(VoterAuthErrorMessages.invalidToken);
  });
});
