import {
  insertableBallotPaperObject,
  insertableElectionObject,
  Parameter,
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
import { findUserBy } from '../../src/services/users.service.js';
import { createElection } from './../../src/services/elections.service.js';

const TOKEN = '1234';

let requestPath = '';
let requestPath2 = '';
const demoElection = insertableElectionObject.parse({
  name: 'My test election',
  description: 'My description',
  private: true,
  votingStartAt: '2025-06-16T14:30:00Z',
  votingEndAt: '2025-06-18T14:30:00Z',
  allowInvalidVotes: false,
});
const demoBallotPaper = insertableBallotPaperObject.parse({
  name: 'Test BallotPaper',
  description: 'Test description',
  maxVotes: 5,
  maxVotesPerCandidate: 3,
});

describe(`POST /elections/:${Parameter.electionId}/ballotPapers`, () => {
  // Setup the test environment
  beforeAll(async () => {
    const user = await findUserBy({ email: 'user@votura.org' });
    const user2 = await findUserBy({ email: 'user2@votura.org' });
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

  it('should create an election when authorized and body is valid', async () => {
    const res = await request(app)
      .post(requestPath)
      .set('Authorization', TOKEN)
      .send(demoBallotPaper);
    expect(res.status).toBe(HttpStatusCode.Created);
    expect(res.type).toBe('application/json');
    const parseResult = selectableBallotPaperObject.safeParse(res.body);
    expect(parseResult.success).toBe(true);
  });
  it('400: should throw error missing fields', async () => {
    const res = await request(app).post(requestPath).set('Authorization', TOKEN).send({
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
      .set('Authorization', TOKEN)
      .send(demoBallotPaper);
    expect(res.status).toBe(HttpStatusCode.BadRequest);
    expect(res.type).toBe('application/json');
    const parseResult = response400Object.safeParse(res.body);
    expect(parseResult.success).toBe(true);
  });
  it('403: when user is not the owner of the election', async () => {
    const res = await request(app)
      .post(requestPath2)
      .set('Authorization', TOKEN)
      .send(demoBallotPaper);
    expect(res.status).toBe(HttpStatusCode.Forbidden);
    expect(res.type).toBe('application/json');
    const parseResult = response403Object.safeParse(res.body);
    expect(parseResult.success).toBe(true);
  });
  it('404: when election uuid does not exist', async () => {
    const res = await request(app)
      .post('/elections/b3e3b70b-4008-4694-afc6-5e454ebcbd42/ballotPapers')
      .set('Authorization', TOKEN)
      .send(demoBallotPaper);
    expect(res.status).toBe(HttpStatusCode.NotFound);
    expect(res.type).toBe('application/json');
    const parseResult = response404Object.safeParse(res.body);
    expect(parseResult.success).toBe(true);
  });
  it('406: when Accept header is not application/json', async () => {
    const res = await request(app)
      .post(requestPath)
      .set('Authorization', TOKEN)
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
      .set('Authorization', TOKEN)
      .send('<name>My test ballot paper</name>');
    expect(res.status).toBe(HttpStatusCode.UnsupportedMediaType);
    expect(res.type).toBe('application/json');
    const parseResult = response415Object.safeParse(res.body);
    expect(parseResult.success).toBe(true);
  });
});
