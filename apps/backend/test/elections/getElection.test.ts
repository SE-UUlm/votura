import {
  type ApiTokenUser,
  response404Object,
  response406Object,
  type SelectableElection,
  selectableElectionObject,
  type SelectableUser,
} from '@repo/votura-validators';
import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';
import { app } from '../../src/app.js';
import { generateUserTokens } from '../../src/auth/utils.js';
import { HttpStatusCode } from '../../src/httpStatusCode.js';
import { createElection } from '../../src/services/elections.service.js';
import { createUser, findUserBy } from '../../src/services/users.service.js';

describe('GET /elections/:electionId', () => {
  const ELECTIONS_SLUG = '/elections';

  let user: SelectableUser | null = null;
  let election: SelectableElection | null = null;
  let tokens: ApiTokenUser = { accessToken: '', refreshToken: '' };

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
      user.id,
    );

    tokens = generateUserTokens(user.id);
  });

  it('200: should get a specific election', async () => {
    const res = await request(app)
      .get(`${ELECTIONS_SLUG}/${election?.id}`)
      .set('Authorization', `Bearer ${tokens.accessToken}`)
      .send();

    expect(res.status).toBe(HttpStatusCode.ok);
    expect(res.type).toBe('application/json');
    const parseResult = await selectableElectionObject.safeParseAsync(res.body);
    expect(parseResult.success).toBe(true);
  });

  it('should return 406 Not Acceptable when Accept header is not application/json', async () => {
    const res = await request(app)
      .get(`${ELECTIONS_SLUG}/${election?.id}`)
      .set('Authorization', `Bearer ${tokens.accessToken}`)
      .set('Accept', 'text/plain')
      .send();

    expect(res.status).toBe(HttpStatusCode.notAcceptable);
    expect(res.type).toBe('application/json');
    const parseResult = await response406Object.safeParseAsync(res.body);
    expect(parseResult.success).toBe(true);
  });

  it('should return 404 Not Found when there is no election', async () => {
    const res = await request(app)
      .get(`${ELECTIONS_SLUG}/2085733f-4862-4028-93ac-851a51b2c95b`)
      .set('Authorization', `Bearer ${tokens.accessToken}`)
      .send();

    expect(res.status).toBe(HttpStatusCode.notFound);
    expect(res.type).toBe('application/json');
    const parseResult = await response404Object.safeParseAsync(res.body);
    expect(parseResult.success).toBe(true);
  });
});
