import { parameter, selectableBallotPaperObject, type ApiTokenUser } from '@repo/votura-validators';
import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';
import { app } from '../../src/app.js';
import { generateUserTokens } from '../../src/auth/utils.js';
import { HttpStatusCode } from '../../src/httpStatusCode.js';
import { createUser, findUserBy } from '../../src/services/users.service.js';
import { demoBallotPaper, demoElection, demoUser } from '../mockData.js';
import { createBallotPaper } from './../../src/services/ballotPapers.service.js';
import { createElection } from './../../src/services/elections.service.js';

describe(`POST /elections/:${parameter.electionId}/ballotPapers`, () => {
  let requestPath = '';
  let tokens: ApiTokenUser = { accessToken: '', refreshToken: '' };

  beforeAll(async () => {
    await createUser(demoUser);
    const user = await findUserBy({ email: demoUser.email });
    if (user === null) {
      throw new Error('Failed to find test user');
    }

    const election = await createElection(demoElection, user.id);
    if (election === null) {
      throw new Error('Failed to create test election');
    }

    const ballotPaper = await createBallotPaper(demoBallotPaper, election.id);
    const ballotPaper2 = await createBallotPaper(demoBallotPaper, election.id);
    if (ballotPaper === null || ballotPaper2 === null) {
      throw new Error('Failed to create test ballot paper');
    }

    requestPath = `/elections/${election.id}/ballotPapers`;

    tokens = generateUserTokens(user.id);
  });

  it('200: should get all ballot papers for an election', async () => {
    const res = await request(app)
      .get(requestPath)
      .set('Authorization', `Bearer ${tokens.accessToken}`);
    expect(res.status).toBe(HttpStatusCode.Ok);
    expect(res.type).toBe('application/json');

    const arrBody = res.body as unknown[];
    expect(arrBody).toBeInstanceOf(Array);
    expect(arrBody.length).toBe(2);

    const ballotPapers = await Promise.all(
      arrBody.map((ballotPaper) => selectableBallotPaperObject.safeParseAsync(ballotPaper)),
    );

    ballotPapers.forEach((ballotPaper) => {
      expect(ballotPaper.success).toBe(true);
    });
  });
});
