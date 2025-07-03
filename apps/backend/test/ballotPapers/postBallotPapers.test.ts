import {
  parameter,
  response400Object,
  response403Object,
  response404Object,
  response406Object,
  response415Object,
  selectableBallotPaperObject,
} from '@repo/votura-validators';
import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';
import { app } from '../../src/app.js';
import { HttpStatusCode } from '../../src/httpStatusCode.js';
import { createUser, findUserBy } from '../../src/services/users.service.js';
import { DEMO_TOKEN, demoBallotPaper, demoElection, demoUser, demoUser2 } from '../mockData.js';
import { createElection } from './../../src/services/elections.service.js';

describe(`POST /elections/:${parameter.electionId}/ballotPapers`, () => {
  let requestPath = '';
  let requestPath2 = '';

  beforeAll(async () => {
    await createUser(demoUser);
    await createUser(demoUser2);
    const user = await findUserBy({ email: demoUser.email });
    const user2 = await findUserBy({ email: demoUser2.email });
    if (user === null || user2 === null) {
      throw new Error('Failed to find test user');
    }

    const election = await createElection(demoElection, user.id);
    const election2 = await createElection(demoElection, user2.id);
    if (election === null || election2 === null) {
      throw new Error('Failed to create test election');
    }

    requestPath = `/elections/${election.id}/ballotPapers`;
    requestPath2 = `/elections/${election2.id}/ballotPapers`;
  });

  it('200: should create an election when authorized and body is valid', async () => {
    const res = await request(app)
      .post(requestPath)
      .set('Authorization', DEMO_TOKEN)
      .send(demoBallotPaper);
    expect(res.status).toBe(HttpStatusCode.Created);
    expect(res.type).toBe('application/json');
    const parseResult = selectableBallotPaperObject.safeParse(res.body);
    expect(parseResult.success).toBe(true);
  });
  it('400: should throw error missing fields', async () => {
    const res = await request(app).post(requestPath).set('Authorization', DEMO_TOKEN).send({
      description: 'Test description',
      maxVotes: 5,
      maxVotesPerCandidate: 3,
    });
    expect(res.status).toBe(HttpStatusCode.BadRequest);
    expect(res.type).toBe('application/json');
    const parseResult = response400Object.safeParse(res.body);
    expect(parseResult.success).toBe(true);
  });
  it('400: when no valid election uuid is provided', async () => {
    const res = await request(app)
      .post('/elections/invalid/ballotPapers')
      .set('Authorization', DEMO_TOKEN)
      .send(demoBallotPaper);
    expect(res.status).toBe(HttpStatusCode.BadRequest);
    expect(res.type).toBe('application/json');
    const parseResult = response400Object.safeParse(res.body);
    expect(parseResult.success).toBe(true);
  });
  it('403: when user is not the owner of the election', async () => {
    const res = await request(app)
      .post(requestPath2)
      .set('Authorization', DEMO_TOKEN)
      .send(demoBallotPaper);
    expect(res.status).toBe(HttpStatusCode.Forbidden);
    expect(res.type).toBe('application/json');
    const parseResult = response403Object.safeParse(res.body);
    expect(parseResult.success).toBe(true);
  });
  it('404: when election uuid does not exist', async () => {
    const res = await request(app)
      .post('/elections/b3e3b70b-4008-4694-afc6-5e454ebcbd42/ballotPapers')
      .set('Authorization', DEMO_TOKEN)
      .send(demoBallotPaper);
    expect(res.status).toBe(HttpStatusCode.NotFound);
    expect(res.type).toBe('application/json');
    const parseResult = response404Object.safeParse(res.body);
    expect(parseResult.success).toBe(true);
  });
  it('406: when Accept header is not application/json', async () => {
    const res = await request(app)
      .post(requestPath)
      .set('Authorization', DEMO_TOKEN)
      .set('Accept', 'text/plain')
      .send(demoBallotPaper);
    expect(res.status).toBe(HttpStatusCode.NotAcceptable);
    expect(res.type).toBe('application/json');
    const parseResult = response406Object.safeParse(res.body);
    expect(parseResult.success).toBe(true);
  });
  it('415: should throw error on wrong body type xml', async () => {
    const res = await request(app)
      .post(requestPath)
      .set('Authorization', DEMO_TOKEN)
      .send('<name>My test ballot paper</name>');
    expect(res.status).toBe(HttpStatusCode.UnsupportedMediaType);
    expect(res.type).toBe('application/json');
    const parseResult = response415Object.safeParse(res.body);
    expect(parseResult.success).toBe(true);
  });
});
