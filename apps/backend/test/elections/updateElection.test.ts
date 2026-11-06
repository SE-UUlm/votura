import {
  parameter,
  response400Object,
  response403Object,
  selectableElectionObject,
  type ApiTokenUser,
  type SelectableElection,
  type SelectableUser,
} from '@repo/votura-validators';
import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';
import { app } from '../../src/app.js';
import { generateUserTokens } from '../../src/auth/utils.js';
import { HttpStatusCode } from '../../src/httpStatusCode.js';
import { createUser, findUserBy } from '../../src/services/users.service.js';
import { brokenElection, demoElection, demoElection2, demoUser, demoUser2 } from '../mockData.js';
import { sleep } from '../utils.js';
import { createElection, getElection } from './../../src/services/elections.service.js';

const MISSING_TEST_DATA = 'Test data is missing, cannot proceed with test';

describe(`PUT /elections/:${parameter.electionId}`, () => {
  let requestPath = '';
  let election: SelectableElection | null = null;
  let tokens: ApiTokenUser = { accessToken: '', refreshToken: '' };

  let adminUser: SelectableUser | null = null;
  let nonAdminUser: SelectableUser | null = null;
  let nonAdminElection: SelectableElection | null = null;
  let nonAdminRequestPath = '';
  let nonAdminTokens: ApiTokenUser = { accessToken: '', refreshToken: '' };

  beforeAll(async () => {
    await createUser(demoUser);
    adminUser = await findUserBy({ email: demoUser.email });
    if (adminUser === null) {
      throw new Error('Failed to find test user');
    }

    election = await createElection(demoElection, adminUser.id);

    requestPath = `/elections/${election.id}`;

    tokens = generateUserTokens(adminUser.id);

    await createUser(demoUser2);
    nonAdminUser = await findUserBy({ email: demoUser2.email });
    if (nonAdminUser === null) {
      throw new Error('Failed to find non admin test user');
    }

    nonAdminElection = await createElection(demoElection, nonAdminUser.id);
    nonAdminRequestPath = `/elections/${nonAdminElection.id}`;
    nonAdminTokens = generateUserTokens(nonAdminUser.id);
  });

  it('200: should update an election and checks modifiedAt update', async () => {
    // get the modifiedAt date before the update
    if (election === null) {
      throw new Error('Election is null, cannot proceed with test');
    }
    const initialModifiedAt = new Date(election.modifiedAt);

    // Wait so that the modifiedAt date is different
    await sleep(2000);
    const res = await request(app)
      .put(requestPath)
      .set('Authorization', `Bearer ${tokens.accessToken}`)
      .send(demoElection2);
    expect(res.status).toBe(HttpStatusCode.ok);
    expect(res.type).toBe('application/json');
    const parseResult = selectableElectionObject.safeParse(res.body);
    expect(parseResult.success).toBe(true);
    if (parseResult.success === true) {
      expect(parseResult.data.id).toBe(election?.id);
      expect(parseResult.data.name).toBe(demoElection2.name);
      expect(parseResult.data.description).toBe(demoElection2.description);
      expect(parseResult.data.private).toBe(demoElection2.private);
      expect(parseResult.data.modifiedAt).toBeDefined();
      expect(new Date(parseResult.data.modifiedAt).getTime()).toBeGreaterThan(
        initialModifiedAt.getTime(),
      );
    }
  });
  it('400: should complain about wrong input data', async () => {
    const res = await request(app)
      .put(requestPath)
      .set('Authorization', `Bearer ${tokens.accessToken}`)
      .send(brokenElection);
    expect(res.status).toBe(HttpStatusCode.badRequest);
    expect(res.type).toBe('application/json');
    const parseResult = response400Object.safeParse(res.body);
    expect(parseResult.success).toBe(true);
  });
  it('403: should not allow a non admin owner to change the election owner', async () => {
    if (adminUser === null || nonAdminUser === null || nonAdminElection === null) {
      throw new Error(MISSING_TEST_DATA);
    }

    const res = await request(app)
      .put(nonAdminRequestPath)
      .set('Authorization', `Bearer ${nonAdminTokens.accessToken}`)
      .send({ ...demoElection2, electionCreatorId: adminUser.id });
    expect(res.status).toBe(HttpStatusCode.forbidden);
    expect(res.type).toBe('application/json');
    const parseResult = response403Object.safeParse(res.body);
    expect(parseResult.success).toBe(true);

    const persistedElection = await getElection(nonAdminElection.id, nonAdminUser.id);
    expect(persistedElection.electionCreatorId).toBe(nonAdminUser.id);
  });
  it('200: should allow an admin to change the election owner', async () => {
    if (adminUser === null || nonAdminElection === null) {
      throw new Error(MISSING_TEST_DATA);
    }

    const res = await request(app)
      .put(nonAdminRequestPath)
      .set('Authorization', `Bearer ${tokens.accessToken}`)
      .send({ ...demoElection2, electionCreatorId: adminUser.id });
    expect(res.status).toBe(HttpStatusCode.ok);
    expect(res.type).toBe('application/json');
    const parseResult = selectableElectionObject.safeParse(res.body);
    expect(parseResult.success).toBe(true);
    if (parseResult.success === true) {
      expect(parseResult.data.electionCreatorId).toBe(adminUser.id);
    }

    const persistedElection = await getElection(nonAdminElection.id, adminUser.id);
    expect(persistedElection.electionCreatorId).toBe(adminUser.id);
  });
});
