import { beforeAll, describe, expect, it } from 'vitest';
import { createUser, findUserBy } from '../../src/services/users.service.js';
import { createElection } from '../../src/services/elections.service.js';
import {
  response404Object,
  response406Object,
  type SelectableElection,
  selectableElectionObject,
  type SelectableUser,
} from '@repo/votura-validators';
import request from 'supertest';
import { app } from '../../src/app.js';
import { HttpStatusCode } from '../../src/httpStatusCode.js';

describe('GET /elections/:electionId', () => {
  const AUTH_TOKEN = '1234';
  const ELECTIONS_SLUG = '/elections';

  let user: SelectableUser | null;
  let election: SelectableElection | null;

  beforeAll(async () => {
    await createUser({
      email: 'user@votura.org',
      password: 'password',
    });

    user = await findUserBy({
      email: 'user@votura.org',
    });

    if (user === null) {
      throw new Error('User not found!');
    }

    election = await createElection(
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
  });

  it('should get a specific election', async () => {
    const res = await request(app)
      .get(`${ELECTIONS_SLUG}/${election?.id}`)
      .set('Authorization', AUTH_TOKEN)
      .send();

    expect(res.status).toBe(HttpStatusCode.Ok);
    expect(res.type).toBe('application/json');
    const parseResult = await selectableElectionObject.safeParseAsync(res.body);
    expect(parseResult.success).toBe(true);
  });

  it('should return 406 Not Acceptable when Accept header is not application/json', async () => {
    const res = await request(app)
      .get(`${ELECTIONS_SLUG}/${election?.id}`)
      .set('Authorization', AUTH_TOKEN)
      .set('Accept', 'text/plain')
      .send();

    expect(res.status).toBe(HttpStatusCode.NotAcceptable);
    expect(res.type).toBe('application/json');
    const parseResult = await response406Object.safeParseAsync(res.body);
    expect(parseResult.success).toBe(true);
  });

  it('should return 404 Not Found when there is no election', async () => {
    const res = await request(app)
      .get(`${ELECTIONS_SLUG}/2085733f-4862-4028-93ac-851a51b2c95b`)
      .set('Authorization', AUTH_TOKEN)
      .send();

    expect(res.status).toBe(HttpStatusCode.NotFound);
    expect(res.type).toBe('application/json');
    const parseResult = await response404Object.safeParseAsync(res.body);
    expect(parseResult.success).toBe(true);
  });
});
