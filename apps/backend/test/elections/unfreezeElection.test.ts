import {
  parameter,
  selectableElectionObject,
  type SelectableElection,
} from '@repo/votura-validators';
import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';
import { app } from '../../src/app.js';
import { HttpStatusCode } from '../../src/httpStatusCode.js';
import { createUser, findUserBy } from '../../src/services/users.service.js';
import { DEMO_TOKEN, demoElection, demoUser } from '../mockData.js';
import { createElection } from './../../src/services/elections.service.js';

describe(`PUT /elections/:${parameter.electionId}/unfreeze`, () => {
  let freezePath = '';
  let unfreezePath = '';
  let election: SelectableElection | null = null;

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
  });

  it('200: should unfreeze a frozen election', async () => {
    await request(app).put(freezePath).set('Authorization', DEMO_TOKEN);
    const res = await request(app).put(unfreezePath).set('Authorization', DEMO_TOKEN);
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
