import {
  parameter,
  type SelectableBallotPaper,
  type SelectableElection,
  type SelectableUser,
} from '@repo/votura-validators';
import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';
import { app } from '../../src/app.js';
import { HttpStatusCode } from '../../src/httpStatusCode.js';
import { createUser, findUserBy } from '../../src/services/users.service.js';
import { DEMO_TOKEN, demoBallotPaper, demoElection, demoUser } from '../mockData.js';
import { createBallotPaper, getBallotPaper } from './../../src/services/ballotPapers.service.js';
import { createElection, getElection } from './../../src/services/elections.service.js';

describe(`DEL /elections/:${parameter.electionId}`, () => {
  let requestPath = '';
  let user: SelectableUser | null = null;
  let election: SelectableElection | null = null;
  let ballotPaper: SelectableBallotPaper | null = null;

  beforeAll(async () => {
    await createUser(demoUser);
    user = await findUserBy({ email: demoUser.email });
    if (user === null) {
      throw new Error('Failed to find test user');
    }

    election = await createElection(demoElection, user.id);
    if (election === null) {
      throw new Error('Failed to create test election');
    }

    ballotPaper = await createBallotPaper(demoBallotPaper, election.id);
    if (ballotPaper === null) {
      throw new Error('Failed to create test ballot paper');
    }

    requestPath = `/elections/${election.id}`;
  });

  it('203: should delete an election', async () => {
    const res = await request(app).delete(requestPath).set('Authorization', DEMO_TOKEN);
    expect(res.status).toBe(HttpStatusCode.NoContent);
    if (election?.id === undefined) {
      throw new Error('Election ID is undefined');
    }
    if (user?.id === undefined) {
      throw new Error('User ID is undefined');
    }
    const dbResult = await getElection(election?.id, user?.id);
    expect(dbResult).toBeNull();

    // Check cascade deletion of ballot paper
    if (ballotPaper?.id === undefined) {
      throw new Error('Ballot Paper ID is undefined');
    }
    const ballotPaperResult = await getBallotPaper(ballotPaper?.id);
    expect(ballotPaperResult).toBeNull();
  });
});
