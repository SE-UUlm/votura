import request from 'supertest';
import { describe, it, expect, beforeAll } from 'vitest';
import { app } from '../../src/app.js';
import {
  insertableElectionObject,
  insertableBallotPaperObject,
  type InsertableBallotPaper,
  response400Object,
  response415Object,
  response406Object,
  selectableBallotPaperObject,
} from '@repo/votura-validators';
import { HttpStatusCode } from '../../src/httpStatusCode.js';
import { createElection } from './../../src/services/elections.service.js';
import { findUserBy } from '../../src/services/users.service.js';

const TOKEN = '1234';

let requestPath = '';
let demoBallotPaper: InsertableBallotPaper;

describe('POST /elections/:electionId/ballotPapers', () => {
  beforeAll(async () => {
    const user = await findUserBy({ email: 'user@votura.org' });
    if (user === null) {
      throw new Error('Failed to find test user');
    }
    const election = await createElection(
      insertableElectionObject.parse({
        name: 'My test election',
        description: 'My description',
        private: true,
        votingStartAt: '2025-06-16T14:30:00Z',
        votingEndAt: '2025-06-18T14:30:00Z',
        allowInvalidVotes: false,
      }),
      user.id,
    );
    if (election === null) {
      throw new Error('Failed to create test election');
    }
    requestPath = `/elections/${election.id}/ballotPapers`;
    demoBallotPaper = insertableBallotPaperObject.parse({
      name: 'Test BallotPaper',
      description: 'Test description',
      maxVotes: 5,
      maxVotesPerCandidate: 3,
      electionId: election.id,
    });
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
      electionId: '651327a8-ac5c-4125-bb38-d2be6b34bf3b',
    });
    expect(res.status).toBe(HttpStatusCode.BadRequest);
    expect(res.type).toBe('application/json');
    const parseResult = response400Object.safeParse(res.body);
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
