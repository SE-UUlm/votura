import { selectableVoterGroupObject, type ApiTokenUser } from '@repo/votura-validators';
import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';
import { app } from '../../src/app.js';
import { generateUserTokens } from '../../src/auth/utils.js';
import { HttpStatusCode } from '../../src/httpStatusCode.js';
import { createUser, findUserBy } from '../../src/services/users.service.js';
import { createVoterGroup } from '../../src/services/voterGroups.service.js';
import { demoUser, voterGroupNoBallotPapers } from '../mockData.js';

describe(`GET /voterGroups`, () => {
  let tokens: ApiTokenUser = { accessToken: '', refreshToken: '' };

  beforeAll(async () => {
    await createUser(demoUser);
    const user = await findUserBy({ email: demoUser.email });
    if (user === null) {
      throw new Error('Failed to create test user');
    }

    // Create two voter groups for the user
    await createVoterGroup(voterGroupNoBallotPapers, user.id);
    await createVoterGroup(voterGroupNoBallotPapers, user.id);

    tokens = generateUserTokens(user.id);
  });

  it('200: should return a list of voter groups for the user', async () => {
    const res = await request(app)
      .get('/voterGroups')
      .set('Authorization', `Bearer ${tokens.accessToken}`);
    expect(res.status).toBe(HttpStatusCode.ok);
    expect(res.type).toBe('application/json');
    const parseResult = selectableVoterGroupObject.array().safeParse(res.body);
    expect(parseResult.success).toBe(true);
    if (parseResult.success) {
      expect(parseResult.data.length).toBe(2);
      expect(parseResult.data[0]?.name).toBe(voterGroupNoBallotPapers.name);
      expect(parseResult.data[0]?.description).toBe(voterGroupNoBallotPapers.description);
      expect(parseResult.data[0]?.numberOfVoters).toBe(voterGroupNoBallotPapers.numberOfVoters);
      expect(parseResult.data[0]?.ballotPapers).toEqual([]);
    }
  });
});
