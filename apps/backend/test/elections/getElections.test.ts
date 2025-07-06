import { response406Object, selectableElectionObject, type ApiTokenUser } from '@repo/votura-validators';
import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';
import { app } from '../../src/app.js';
import { HttpStatusCode } from '../../src/httpStatusCode.js';
import { createElection } from '../../src/services/elections.service.js';
import { createUser, findUserBy } from '../../src/services/users.service.js';
import { generateUserTokens } from '../../src/auth/utils.js';

describe('GET /elections', () => {
  const ELECTIONS_SLUG = '/elections';
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

    const election = await createElection(
      {
        private: true,
        name: 'Election 1',
        description: 'This is election one',
        votingStartAt: '2024-07-29T15:51:28.071Z',
        votingEndAt: '2024-07-30T15:51:28.071Z',
        allowInvalidVotes: false,
      },
      user?.id,
    );

    if (election === null) {
      throw new Error('Election not found!');
    }

    tokens = generateUserTokens(user.id);
  });

  it('should get all elections', async () => {
    const res = await request(app).get(ELECTIONS_SLUG).set('Authorization', `Bearer ${tokens.accessToken}`).send();

    expect(res.status).toBe(HttpStatusCode.Ok);
    expect(res.type).toBe('application/json');
    expect(res.body).toBeInstanceOf(Array);
    const arrBody = res.body as unknown[];
    expect(arrBody.length).toBe(1);

    const parseResult = await Promise.all(
      arrBody.map((el) => selectableElectionObject.safeParseAsync(el)),
    );

    parseResult.forEach((result) => {
      expect(result.success).toBe(true);
    });
  });

  it('should return 406 Not Acceptable when Accept header is not application/json', async () => {
    const res = await request(app)
      .get(ELECTIONS_SLUG)
      .set('Authorization', `Bearer ${tokens.accessToken}`)
      .set('Accept', 'text/plain')
      .send();

    expect(res.status).toBe(HttpStatusCode.NotAcceptable);
    expect(res.type).toBe('application/json');
    const parseResult = await response406Object.safeParseAsync(res.body);
    expect(parseResult.success).toBe(true);
  });
});
