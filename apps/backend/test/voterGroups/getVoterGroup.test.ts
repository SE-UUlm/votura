import { parameter, selectableVoterGroupObject, type ApiTokenUser } from '@repo/votura-validators';
import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';
import { app } from '../../src/app.js';
import { generateUserTokens } from '../../src/auth/utils.js';
import { HttpStatusCode } from '../../src/httpStatusCode.js';
import { createUser, findUserBy } from '../../src/services/users.service.js';
import { createVoterGroup } from '../../src/services/voterGroups.service.js';
import { demoUser, voterGroupNoBallotPapers } from '../mockData.js';

describe(`GET /voterGroups/:${parameter.voterGroupId}`, () => {
  let requestPath = '';
  let tokens: ApiTokenUser = { accessToken: '', refreshToken: '' };
  let voterGroupId = '';

  beforeAll(async () => {
    await createUser(demoUser);
    const user = await findUserBy({ email: demoUser.email });
    if (user === null) {
      throw new Error('Failed to create test user');
    }

    const voterGroup = await createVoterGroup(voterGroupNoBallotPapers, user.id);
    voterGroupId = voterGroup.id;

    requestPath = `/voterGroups/${voterGroupId}`;
    tokens = generateUserTokens(user.id);
  });

  it('200: should return a voter group by ID', async () => {
    const res = await request(app)
      .get(requestPath)
      .set('Authorization', `Bearer ${tokens.accessToken}`);

    expect(res.status).toBe(HttpStatusCode.ok);
    expect(res.type).toBe('application/json');
    const parseResult = selectableVoterGroupObject.safeParse(res.body);
    expect(parseResult.success).toBe(true);
    if (parseResult.success) {
      expect(parseResult.data.id).toBe(voterGroupId);
      expect(parseResult.data.name).toBe(voterGroupNoBallotPapers.name);
      expect(parseResult.data.description).toBe(voterGroupNoBallotPapers.description);
      expect(parseResult.data.numberOfVoters).toBe(voterGroupNoBallotPapers.numberOfVoters);
      expect(parseResult.data.ballotPapers).toEqual(voterGroupNoBallotPapers.ballotPapers);
    }
  });
});
