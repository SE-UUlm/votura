import {
  parameter,
  selectableElectionObject,
  type ApiTokenUser,
  type SelectableElection,
} from '@repo/votura-validators';
import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';
import { app } from '../../src/app.js';
import { HttpStatusCode } from '../../src/httpStatusCode.js';
import { createUser, findUserBy } from '../../src/services/users.service.js';
import { demoElection, demoUser } from '../mockData.js';
import { createElection } from './../../src/services/elections.service.js';
import { generateUserTokens } from '../../src/auth/utils.js';

describe(`PUT /elections/:${parameter.electionId}/unfreeze`, () => {
  let freezePath = '';
  let unfreezePath = '';
  let election: SelectableElection | null = null;
  let tokens: ApiTokenUser = { accessToken: '', refreshToken: '' };

  beforeAll(async () => {
    await createUser(demoUser);
    const user = await findUserBy({ email: demoUser.email });
    if (user === null) {
      throw new Error('Failed to find test user');
    }

    election = await createElection(demoElection, user.id);
    if (election === null) {
      throw new Error('Failed to create test election');
    }

    freezePath = `/elections/${election.id}/freeze`;
    unfreezePath = `/elections/${election.id}/unfreeze`;

    tokens = generateUserTokens(user.id);
  });

  it('200: should unfreeze a frozen election', async () => {
    await request(app).put(freezePath).set('Authorization', `Bearer ${tokens.accessToken}`);
    const res = await request(app).put(unfreezePath).set('Authorization', `Bearer ${tokens.accessToken}`);
    expect(res.status).toBe(HttpStatusCode.Ok);
    expect(res.type).toBe('application/json');
    const parseResult = selectableElectionObject.safeParse(res.body);
    expect(parseResult.success).toBe(true);
    if (parseResult.success === true) {
      expect(parseResult.data.id).toBe(election?.id);
      expect(parseResult.data.configFrozen).toBe(false);
    }
  });
});
