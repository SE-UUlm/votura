import {
  Parameter,
  type SelectableBallotPaper,
  type SelectableElection,
} from '@repo/votura-validators';
import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';
import { app } from '../../src/app.js';
import { HttpStatusCode } from '../../src/httpStatusCode.js';
import { createUser, findUserBy } from '../../src/services/users.service.js';
import { DEMO_TOKEN, demoBallotPaper, demoElection, demoUser } from '../mockData.js';
import { createBallotPaper, getBallotPaper } from './../../src/services/ballotPapers.service.js';
import { createElection } from './../../src/services/elections.service.js';

describe(`DEL /elections/:${Parameter.electionId}/ballotPapers/:${Parameter.ballotPaperId}`, () => {
  let requestPath = '';
  let election: SelectableElection | null = null;
  let ballotPaper: SelectableBallotPaper | null = null;

  beforeAll(async () => {
    await createUser(demoUser);
    const user = await findUserBy({ email: demoUser.email });
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

    requestPath = `/elections/${election.id}/ballotPapers/${ballotPaper.id}`;
  });

  it('203: should delete a ballot paper', async () => {
    const res = await request(app).delete(requestPath).set('Authorization', DEMO_TOKEN);
    expect(res.status).toBe(HttpStatusCode.NoContent);
    if (ballotPaper?.id === undefined) {
      throw new Error('Ballot paper ID is undefined');
    }
    expect(getBallotPaper(ballotPaper?.id)).resolves.toBeNull();
  });
});
