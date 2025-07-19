import {
  response400Object,
  response403Object,
  response404Object,
  selectableVoterGroupObject,
  type ApiTokenUser,
} from '@repo/votura-validators';
import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';
import { app } from '../../src/app.js';
import { generateUserTokens } from '../../src/auth/utils.js';
import { VoterGroupValidationError } from '../../src/controllers/bodyChecks/voterGroup.js';
import { HttpStatusCode } from '../../src/httpStatusCode.js';
import { createUser, findUserBy } from '../../src/services/users.service.js';
import {
  demoBallotPaper,
  demoBallotPaper2,
  demoElection,
  demoElection2,
  demoUser,
  demoUser2,
  voterGroupNoBallotPapers,
} from '../mockData.js';
import { createBallotPaper } from './../../src/services/ballotPapers.service.js';
import { createElection, freezeElection } from './../../src/services/elections.service.js';

describe(`POST /voterGroups`, () => {
  const requestPath = '/voterGroups';
  let election1Id: string | null = null;
  let ballotPaper1Election1Id: string | null = null;
  let ballotPaper2Election1Id: string | null = null;
  let ballotPaper1Election2Id: string | null = null;
  let ballotPaperUser2Id: string | null = null;
  let tokens: ApiTokenUser = { accessToken: '', refreshToken: '' };

  beforeAll(async () => {
    await createUser(demoUser);
    const user1 = await findUserBy({ email: demoUser.email });
    if (user1 === null) {
      throw new Error('Failed to find test user 1');
    }
    await createUser(demoUser2);
    const user2 = await findUserBy({ email: demoUser2.email });
    if (user2 === null) {
      throw new Error('Failed to find test user 2');
    }

    // Create two elections and a ballot paper for each for user1
    const election1 = await createElection(demoElection, user1.id);
    election1Id = election1.id;
    const election2 = await createElection(demoElection2, user1.id);
    const ballotPaper1 = await createBallotPaper(demoBallotPaper, election1.id);
    const ballotPaper2 = await createBallotPaper(demoBallotPaper2, election2.id);
    ballotPaper1Election1Id = ballotPaper1.id;
    ballotPaper1Election2Id = ballotPaper2.id;

    // create another ballot paper for election1 for user1
    const ballotPaper1Election1 = await createBallotPaper(demoBallotPaper2, election1.id);
    ballotPaper2Election1Id = ballotPaper1Election1.id;

    // create an election and a ballot paper for user2
    const electionUser2 = await createElection(demoElection, user2.id);
    const ballotPaperUser2 = await createBallotPaper(demoBallotPaper, electionUser2.id);
    ballotPaperUser2Id = ballotPaperUser2.id;

    // Create tokens for the user
    tokens = generateUserTokens(user1.id);
  });

  it('201: should create a voter group without linking to a ballot paper', async () => {
    const res = await request(app)
      .post(requestPath)
      .set('Authorization', `Bearer ${tokens.accessToken}`)
      .send(voterGroupNoBallotPapers);

    expect(res.status).toBe(HttpStatusCode.created);
    expect(res.type).toBe('application/json');
    const parseResult = selectableVoterGroupObject.safeParse(res.body);
    expect(parseResult.success).toBe(true);
    expect(parseResult.data?.name).toBe(voterGroupNoBallotPapers.name);
    expect(parseResult.data?.description).toBe(voterGroupNoBallotPapers.description);
    expect(parseResult.data?.numberOfVoters).toBe(voterGroupNoBallotPapers.numberOfVoters);
    expect(parseResult.data?.ballotPapers).toEqual([]);
  });

  it('201: should create a voter group linked to multiple ballot papers', async () => {
    const res = await request(app)
      .post(requestPath)
      .set('Authorization', `Bearer ${tokens.accessToken}`)
      .send({
        ...voterGroupNoBallotPapers,
        ballotPapers: [ballotPaper1Election1Id, ballotPaper1Election2Id],
      });

    expect(res.status).toBe(HttpStatusCode.created);
    expect(res.type).toBe('application/json');
    const parseResult = selectableVoterGroupObject.safeParse(res.body);
    expect(parseResult.success).toBe(true);
    expect(parseResult.data?.name).toBe(voterGroupNoBallotPapers.name);
    expect(parseResult.data?.description).toBe(voterGroupNoBallotPapers.description);
    expect(parseResult.data?.numberOfVoters).toBe(voterGroupNoBallotPapers.numberOfVoters);
    expect(parseResult.data?.ballotPapers).toContain(ballotPaper1Election1Id);
    expect(parseResult.data?.ballotPapers).toContain(ballotPaper1Election2Id);
  });
  it('400: should return error when trying to create a voter group not conforming to the schema', async () => {
    const res = await request(app)
      .post(requestPath)
      .set('Authorization', `Bearer ${tokens.accessToken}`)
      .send({
        description: 'This voter group has no name',
        numberOfVoters: 10,
        ballotPapers: [],
      });

    expect(res.status).toBe(HttpStatusCode.badRequest);
    expect(res.type).toBe('application/json');
    const parseResult = response400Object.safeParse(res.body);
    expect(parseResult.success).toBe(true);
  });
  it('404: should return error when trying to create a voter group with a ballot paper that does not exist', async () => {
    const res = await request(app)
      .post(requestPath)
      .set('Authorization', `Bearer ${tokens.accessToken}`)
      .send({
        ...voterGroupNoBallotPapers,
        ballotPapers: ['95433e11-6055-4e6e-b517-2ea4cc42e9c6'], // Non-existent, random ballot paper ID
      });

    expect(res.status).toBe(HttpStatusCode.notFound);
    expect(res.type).toBe('application/json');
    const parseResult = response404Object.safeParse(res.body);
    expect(parseResult.success).toBe(true);
    expect(parseResult.data?.message).toBe(VoterGroupValidationError.ballotPaperNotFound);
  });
  it('403: should return error when trying to create a voter group with a ballot paper that does not belong to the user', async () => {
    const res = await request(app)
      .post(requestPath)
      .set('Authorization', `Bearer ${tokens.accessToken}`)
      .send({
        ...voterGroupNoBallotPapers,
        ballotPapers: [ballotPaperUser2Id], // Ballot paper from another user
      });

    expect(res.status).toBe(HttpStatusCode.forbidden);
    expect(res.type).toBe('application/json');
    const parseResult = response403Object.safeParse(res.body);
    expect(parseResult.success).toBe(true);
    expect(parseResult.data?.message).toBe(VoterGroupValidationError.ballotPaperNotBelongToUser);
  });
  it('400: should return error when trying to create a voter group with ballot papers from the same election', async () => {
    const res = await request(app)
      .post(requestPath)
      .set('Authorization', `Bearer ${tokens.accessToken}`)
      .send({
        ...voterGroupNoBallotPapers,
        ballotPapers: [ballotPaper1Election1Id, ballotPaper2Election1Id], // Both ballot papers from the same election
      });

    expect(res.status).toBe(HttpStatusCode.badRequest);
    expect(res.type).toBe('application/json');
    const parseResult = response400Object.safeParse(res.body);
    expect(parseResult.success).toBe(true);
    expect(parseResult.data?.message).toBe(VoterGroupValidationError.ballotPapersFromSameElection);
  });
  it('400: should return error when trying to create a voter group with ballot papers from frozen elections', async () => {
    // set election1 to frozen
    if (election1Id === null) {
      throw new Error('Election 1 ID is null');
    }
    await freezeElection(election1Id);

    const res = await request(app)
      .post(requestPath)
      .set('Authorization', `Bearer ${tokens.accessToken}`)
      .send({
        ...voterGroupNoBallotPapers,
        ballotPapers: [ballotPaper1Election1Id], // Ballot paper from a frozen election
      });

    expect(res.status).toBe(HttpStatusCode.badRequest);
    expect(res.type).toBe('application/json');
    const parseResult = response400Object.safeParse(res.body);
    expect(parseResult.success).toBe(true);
    expect(parseResult.data?.message).toBe(
      VoterGroupValidationError.ballotPapersFromFrozenElection,
    );
  });
});
