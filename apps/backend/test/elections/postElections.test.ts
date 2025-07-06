import {
  insertableElectionObject,
  response400Object,
  response406Object,
  response415Object,
  selectableElectionObject,
  type ApiTokenUser,
} from '@repo/votura-validators';
import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';
import { app } from '../../src/app.js';
import { HttpStatusCode } from '../../src/httpStatusCode.js';
import { createUser, findUserBy } from '../../src/services/users.service.js';
import { generateUserTokens } from '../../src/auth/utils.js';

const REQUEST = '/elections';
const demoElection = insertableElectionObject.parse({
  name: 'My test election',
  description: 'My description',
  private: true,
  votingStartAt: '2025-06-16T14:30:00Z',
  votingEndAt: '2025-06-18T14:30:00Z',
  allowInvalidVotes: false,
});

describe('POST /elections', () => {
  let tokens: ApiTokenUser = { accessToken: '', refreshToken: '' };
  beforeAll(async () => {
    await createUser({
      email: 'user@votura.org',
      password: 'password',
    });

    const user = await findUserBy({
      email: 'user@votura.org',
    });

    if (user === null) {
      throw new Error('User not found!');
    }

    // Create tokens for the user
    tokens = generateUserTokens(user.id);
  });

  it('should create an election when authorized and body is valid', async () => {
    const res = await request(app).post(REQUEST).set('Authorization', `Bearer ${tokens.accessToken}`).send(demoElection);
    expect(res.status).toBe(HttpStatusCode.Created);
    expect(res.type).toBe('application/json');
    const parseResult = selectableElectionObject.safeParse(res.body);
    expect(parseResult.success).toBe(true);
  });

  it('should throw error missing fields', async () => {
    const res = await request(app).post(REQUEST).set('Authorization', `Bearer ${tokens.accessToken}`).send({
      name: 'My test election',
      description: 'My description',
      private: true,
      votingStartAt: '2025-06-16T14:30:00Z',
      allowInvalidVotes: false,
    });
    expect(res.status).toBe(HttpStatusCode.BadRequest);
    expect(res.type).toBe('application/json');
    const parseResult = response400Object.safeParse(res.body);
    expect(parseResult.success).toBe(true);
  });
  it('should throw error on wrong body type xml', async () => {
    const res = await request(app)
      .post(REQUEST)
      .set('Authorization', `Bearer ${tokens.accessToken}`)
      .send(
        '<election><name>My test election</name><description>My description</description><private>true</private><votingStartAt>2025-06-16T14:30:00Z</votingStartAt><votingEndAt>2025-06-18T14:30:00Z</votingEndAt><allowInvalidVotes>false</allowInvalidVotes></election>',
      );
    expect(res.status).toBe(HttpStatusCode.UnsupportedMediaType);
    expect(res.type).toBe('application/json');
    const parseResult = response415Object.safeParse(res.body);
    expect(parseResult.success).toBe(true);
  });
  it('should return 406 Not Acceptable when Accept header is not application/json', async () => {
    const res = await request(app)
      .post(REQUEST)
      .set('Authorization', `Bearer ${tokens.accessToken}`)
      .set('Accept', 'text/plain')
      .send(demoElection);
    expect(res.status).toBe(HttpStatusCode.NotAcceptable);
    expect(res.type).toBe('application/json');
    const parseResult = response406Object.safeParse(res.body);
    expect(parseResult.success).toBe(true);
  });
});
