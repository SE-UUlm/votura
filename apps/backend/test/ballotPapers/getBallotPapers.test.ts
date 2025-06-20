import { Parameter, selectableBallotPaperObject } from '@repo/votura-validators';
import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';
import { app } from '../../src/app.js';
import { HttpStatusCode } from '../../src/httpStatusCode.js';
import { createUser, findUserBy } from '../../src/services/users.service.js';
import { demoBallotPaper, demoElection } from '../mockData.js';
import { createBallotPaper } from './../../src/services/ballotPapers.service.js';
import { createElection } from './../../src/services/elections.service.js';

const TOKEN = '1234';
let requestPath = '';

describe(`POST /elections/:${Parameter.electionId}/ballotPapers`, () => {
  beforeAll(async () => {
    await createUser({
      email: 'user@votura.org',
      password: 'hashedpassword',
    });

    const user = await findUserBy({ email: 'user@votura.org' });

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
  });

  it('200: should get all ballot papers for an election', async () => {
    const res = await request(app).get(requestPath).set('Authorization', TOKEN);
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
