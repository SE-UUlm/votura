import {
  insertableVoterGroupObject,
  response400Object,
  response403Object,
  response404Object,
  selectableVoterGroupObject,
  type ApiTokenUser,
  type SelectableVoterGroup,
} from '@repo/votura-validators';
import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';
import { app } from '../../src/app.js';
import { generateUserTokens } from '../../src/auth/utils.js';
import { HttpStatusCode } from '../../src/httpStatusCode.js';
import { createUser, findUserBy } from '../../src/services/users.service.js';
import { createVoterGroup } from '../../src/services/voterGroups.service.js';
import {
  demoBallotPaper,
  demoElection,
  demoUser,
  demoUser2,
  voterGroupNoBallotPapers,
} from '../mockData.js';
import { createBallotPaper } from './../../src/services/ballotPapers.service.js';
import { createElection, freezeElection } from './../../src/services/elections.service.js';

describe(`PUT /voterGroups/:voterGroupId`, () => {
  let requestPath = '';
  let tokens: ApiTokenUser = { accessToken: '', refreshToken: '' };
  let originalVoterGroup: SelectableVoterGroup | null = null;
  let ballotPaperId: string | null = null;
  let voterGroup2Id: string | null = null;
  let frozenVoterGroupId: string | null = null;

  beforeAll(async () => {
    await createUser(demoUser);
    const user = await findUserBy({ email: demoUser.email });
    if (user === null) {
      throw new Error('Failed to create test user');
    }
    await createUser(demoUser2);
    const user2 = await findUserBy({ email: demoUser2.email });
    if (user2 === null) {
      throw new Error('Failed to create test user 2');
    }

    // Create a voter group for the user to update
    originalVoterGroup = await createVoterGroup(voterGroupNoBallotPapers, user.id);

    // election and ballot paper to update the group with
    const election = await createElection(demoElection, user.id);
    const ballotPaper = await createBallotPaper(demoBallotPaper, election.id);
    ballotPaperId = ballotPaper.id;

    // Create a voter group for user2, which user should not be able to update
    voterGroup2Id = (await createVoterGroup(voterGroupNoBallotPapers, user2.id)).id;

    // Create a frozen voter group which user should not be able to update
    const frozenElection = await createElection(
      { ...demoElection, name: 'Frozen Election' },
      user.id,
    );
    const frozenBallotPaper = await createBallotPaper(
      { ...demoBallotPaper, name: 'Frozen Ballot Paper' },
      frozenElection.id,
    );
    const frozenVoterGroup = await createVoterGroup(
      { ...voterGroupNoBallotPapers, ballotPapers: [frozenBallotPaper.id] },
      user.id,
    );
    frozenVoterGroupId = frozenVoterGroup.id;
    await freezeElection(frozenElection.id);

    requestPath = `/voterGroups/${originalVoterGroup.id}`;
    tokens = generateUserTokens(user.id);
  });

  it('200: should update the voter group with more voters and new ballot paper', async () => {
    if (originalVoterGroup === null) {
      throw new Error('Original voter group is null, cannot proceed with test');
    }

    const res = await request(app)
      .put(requestPath)
      .set('Authorization', `Bearer ${tokens.accessToken}`)
      .send(
        insertableVoterGroupObject.parse({
          name: 'Updated Voter Group',
          description: 'This is an updated voter group with more voters and a new ballot paper.',
          ballotPapers: [ballotPaperId],
          numberOfVoters: 20,
        }),
      );

    expect(res.status).toBe(HttpStatusCode.ok);
    expect(res.type).toBe('application/json');
    const parseResult = selectableVoterGroupObject.safeParse(res.body);
    expect(parseResult.success).toBe(true);
    if (!parseResult.success) {
      throw new Error('Parse result was not successful');
    }
    expect(parseResult.data).toMatchObject({
      id: originalVoterGroup?.id,
      name: 'Updated Voter Group',
      description: 'This is an updated voter group with more voters and a new ballot paper.',
      ballotPapers: [ballotPaperId],
      numberOfVoters: 20,
    });
    expect(parseResult.data?.createdAt).toBe(originalVoterGroup?.createdAt);
    expect(new Date(parseResult.data?.modifiedAt).getTime()).toBeGreaterThan(
      new Date(originalVoterGroup?.modifiedAt).getTime(),
    );
  });
  it('200: should update the voter group with no ballot paper and fewer voters', async () => {
    if (originalVoterGroup === null) {
      throw new Error('Original voter group is null, cannot proceed with test');
    }

    const res = await request(app)
      .put(requestPath)
      .set('Authorization', `Bearer ${tokens.accessToken}`)
      .send(
        insertableVoterGroupObject.parse({
          name: 'Updated Voter Group No Ballot Paper',
          description: 'This is an updated voter group without a ballot paper.',
          ballotPapers: [],
          numberOfVoters: 10,
        }),
      );

    expect(res.status).toBe(HttpStatusCode.ok);
    expect(res.type).toBe('application/json');
    const parseResult = selectableVoterGroupObject.safeParse(res.body);
    expect(parseResult.success).toBe(true);
    if (!parseResult.success) {
      throw new Error('Parse result was not successful');
    }
    expect(parseResult.data).toMatchObject({
      id: originalVoterGroup?.id,
      name: 'Updated Voter Group No Ballot Paper',
      description: 'This is an updated voter group without a ballot paper.',
      ballotPapers: [],
      numberOfVoters: 10,
    });
    expect(parseResult.data?.createdAt).toBe(originalVoterGroup?.createdAt);
    expect(new Date(parseResult.data?.modifiedAt).getTime()).toBeGreaterThan(
      new Date(originalVoterGroup?.modifiedAt).getTime(),
    );
  });
  it('400: should return error when trying to update a voter group with a malformed ID', async () => {
    const res = await request(app)
      .put('/voterGroups/invalid-id')
      .set('Authorization', `Bearer ${tokens.accessToken}`)
      .send({
        name: 'Invalid Voter Group',
        description: 'This voter group has an invalid ID.',
        ballotPapers: [],
        numberOfVoters: 5,
      });

    expect(res.status).toBe(HttpStatusCode.badRequest);
    expect(res.type).toBe('application/json');
    const parseResult = response400Object.safeParse(res.body);
    expect(parseResult.success).toBe(true);
    expect(parseResult.data?.message).toContain('Invalid UUID');
  });
  it('404: should return error when trying to update a voter group that does not exist', async () => {
    const res = await request(app)
      .put('/voterGroups/2bb74f75-5209-431f-afba-2c5932a486af') // Assuming this ID does not exist
      .set('Authorization', `Bearer ${tokens.accessToken}`)
      .send({
        name: 'Non-existent Voter Group',
        description: 'This voter group does not exist.',
        ballotPapers: [],
        numberOfVoters: 5,
      });

    expect(res.status).toBe(HttpStatusCode.notFound);
    expect(res.type).toBe('application/json');
    const parseResult = response404Object.safeParse(res.body);
    expect(parseResult.success).toBe(true);
    expect(parseResult.data?.message).toContain('does not exist');
  });
  it('403: should return error when trying to update a voter group that does not belong to the user', async () => {
    if (voterGroup2Id === null) {
      throw new Error('Failed to create test voter group 2');
    }

    const res = await request(app)
      .put(`/voterGroups/${voterGroup2Id}`)
      .set('Authorization', `Bearer ${tokens.accessToken}`)
      .send({
        name: 'Unauthorized Update',
        description: 'This voter group update should not be allowed.',
        ballotPapers: [],
        numberOfVoters: 5,
      });

    expect(res.status).toBe(HttpStatusCode.forbidden);
    expect(res.type).toBe('application/json');
    const parseResult = response403Object.safeParse(res.body);
    expect(parseResult.success).toBe(true);
    expect(parseResult.data?.message).toBe(
      'You do not have permission to access or modify this voter group.',
    );
  });
  it('403: should return error when trying to update a voter group linked to a frozen election', async () => {
    if (frozenVoterGroupId === null) {
      throw new Error('Failed to create test frozen voter group');
    }

    const res = await request(app)
      .put(`/voterGroups/${frozenVoterGroupId}`)
      .set('Authorization', `Bearer ${tokens.accessToken}`)
      .send({
        name: 'Frozen Voter Group Update',
        description:
          'This voter group update should not be allowed because the election is frozen.',
        ballotPapers: [],
        numberOfVoters: 5,
      });

    expect(res.status).toBe(HttpStatusCode.forbidden);
    expect(res.type).toBe('application/json');
    const parseResult = response403Object.safeParse(res.body);
    expect(parseResult.success).toBe(true);
    expect(parseResult.data?.message).toBe(
      'At least one election associated with this voter group is frozen.',
    );
  });
});
