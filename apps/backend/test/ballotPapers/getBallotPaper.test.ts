import {
  parameter,
  response400Object,
  response404Object,
  selectableBallotPaperObject,
  type ApiTokenUser,
  type SelectableBallotPaper,
  type SelectableElection,
} from '@repo/votura-validators';
import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';
import { app } from '../../src/app.js';
import { HttpStatusCode } from '../../src/httpStatusCode.js';
import { createUser, findUserBy } from '../../src/services/users.service.js';
import { demoBallotPaper, demoElection, demoElection2, demoUser } from '../mockData.js';
import { createBallotPaper } from './../../src/services/ballotPapers.service.js';
import { createElection } from './../../src/services/elections.service.js';
import { generateUserTokens } from '../../src/auth/utils.js';

describe(`GET /elections/:${parameter.electionId}/ballotPapers/:${parameter.ballotPaperId}`, () => {
  let requestPath = '';
  let requestPath2 = '';
  let election: SelectableElection | null = null;
  let ballotPaper: SelectableBallotPaper | null = null;
  let tokens: ApiTokenUser = { accessToken: '', refreshToken: '' };

  beforeAll(async () => {
    await createUser(demoUser);
    const user = await findUserBy({ email: demoUser.email });
    if (user === null) {
      throw new Error('Failed to find test user');
    }

    election = await createElection(demoElection, user.id);
    const election2 = await createElection(demoElection2, user.id);
    if (election === null || election2 === null) {
      throw new Error('Failed to create test election');
    }

    ballotPaper = await createBallotPaper(demoBallotPaper, election.id);
    if (ballotPaper === null) {
      throw new Error('Failed to create test ballot paper');
    }

    requestPath = `/elections/${election.id}/ballotPapers/${ballotPaper.id}`;
    requestPath2 = `/elections/${election2.id}/ballotPapers/${ballotPaper.id}`;

    tokens = generateUserTokens(user.id);
  });

  it('200: should get a ballot paper for an election', async () => {
    const res = await request(app).get(requestPath).set('Authorization', `Bearer ${tokens.accessToken}`);
    expect(res.status).toBe(HttpStatusCode.Ok);
    expect(res.type).toBe('application/json');
    const parseResult = selectableBallotPaperObject.safeParse(res.body);
    expect(parseResult.success).toBe(true);
    if (parseResult.success === true) {
      expect(parseResult.data.id).toBe(ballotPaper?.id);
      expect(parseResult.data.electionId).toBe(election?.id);
      expect(parseResult.data.name).toBe(demoBallotPaper.name);
      expect(parseResult.data.maxVotes).toBe(demoBallotPaper.maxVotes);
    }
  });
  it('400: should return 400 when ballot paper id is invalid', async () => {
    const res = await request(app)
      .get(`/elections/${election?.id}/ballotPapers/noUUID`)
      .set('Authorization', `Bearer ${tokens.accessToken}`);
    expect(res.status).toBe(HttpStatusCode.BadRequest);
    expect(res.type).toBe('application/json');
    const parseResult = response400Object.safeParse(res.body);
    expect(parseResult.success).toBe(true);
  });
  it('404: should return 404 when ballot paper not exists', async () => {
    const res = await request(app)
      .get(`/elections/${election?.id}/ballotPapers/fe592288-a169-4be0-9c3d-789237d3f075`)
      .set('Authorization', `Bearer ${tokens.accessToken}`);
    expect(res.status).toBe(HttpStatusCode.NotFound);
    expect(res.type).toBe('application/json');
    const parseResult = response404Object.safeParse(res.body);
    expect(parseResult.success).toBe(true);
  });
  it('400: should return 400 when election is not the parent of ballot paper', async () => {
    const res = await request(app).get(requestPath2).set('Authorization', `Bearer ${tokens.accessToken}`);
    expect(res.status).toBe(HttpStatusCode.BadRequest);
    expect(res.type).toBe('application/json');
    const parseResult = response400Object.safeParse(res.body);
    expect(parseResult.success).toBe(true);
  });
});
