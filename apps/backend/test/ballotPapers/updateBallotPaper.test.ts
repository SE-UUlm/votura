import {
  parameter,
  response400Object,
  selectableBallotPaperObject,
  type ApiTokenUser,
  type SelectableBallotPaper,
  type SelectableBallotPaperSection,
  type SelectableElection,
} from '@repo/votura-validators';
import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';
import { app } from '../../src/app.js';
import { generateUserTokens } from '../../src/auth/utils.js';
import { HttpStatusCode } from '../../src/httpStatusCode.js';
import { createUser, findUserBy } from '../../src/services/users.service.js';
import {
  brokenDemoBallotPaper,
  demoBallotPaper,
  demoBallotPaper2,
  demoBallotPaperSection,
  demoElection,
  demoUser,
} from '../mockData.js';
import { createBallotPaper } from './../../src/services/ballotPapers.service.js';
import { createBallotPaperSection } from './../../src/services/ballotPaperSections.service.js';
import { createElection } from './../../src/services/elections.service.js';

describe(`PUT /elections/:${parameter.electionId}/ballotPapers/:${parameter.ballotPaperId}`, () => {
  let requestPath = '';
  let election: SelectableElection | null = null;
  let ballotPaper: SelectableBallotPaper | null = null;
  let ballotPaperSection: SelectableBallotPaperSection | null = null;
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

    ballotPaper = await createBallotPaper(demoBallotPaper, election.id);
    if (ballotPaper === null) {
      throw new Error('Failed to create test ballot paper');
    }

    ballotPaperSection = await createBallotPaperSection(demoBallotPaperSection, ballotPaper.id);
    if (ballotPaperSection === null) {
      throw new Error('Failed to create test ballot paper section');
    }

    requestPath = `/elections/${election.id}/ballotPapers/${ballotPaper.id}`;

    tokens = generateUserTokens(user.id);
  });

  it('200: should update a ballot paper for an election', async () => {
    const res = await request(app)
      .put(requestPath)
      .set('Authorization', `Bearer ${tokens.accessToken}`)
      .send(demoBallotPaper2);
    expect(res.status).toBe(HttpStatusCode.ok);
    expect(res.type).toBe('application/json');
    const parseResult = selectableBallotPaperObject.safeParse(res.body);
    expect(parseResult.success).toBe(true);
    if (parseResult.success === true) {
      expect(parseResult.data.id).toBe(ballotPaper?.id);
      expect(parseResult.data.electionId).toBe(election?.id);
      expect(parseResult.data.name).toBe(demoBallotPaper2.name);
      expect(parseResult.data.maxVotes).toBe(demoBallotPaper2.maxVotes);
    }
  });
  it('400: should complain about wrong input data', async () => {
    const res = await request(app)
      .put(requestPath)
      .set('Authorization', `Bearer ${tokens.accessToken}`)
      .send(brokenDemoBallotPaper);
    expect(res.status).toBe(HttpStatusCode.badRequest);
    expect(res.type).toBe('application/json');
    const parseResult = response400Object.safeParse(res.body);
    expect(parseResult.success).toBe(true);
  });
  it('400: should return error because max votes is lower than associated ballot paper sections', async () => {
    const res = await request(app)
      .put(requestPath)
      .set('Authorization', `Bearer ${tokens.accessToken}`)
      .send({
        ...demoBallotPaper2,
        maxVotes: demoBallotPaperSection.maxVotes - 1,
      });
    expect(res.status).toBe(HttpStatusCode.badRequest);
    expect(res.type).toBe('application/json');
    const parseResult = response400Object.safeParse(res.body);
    expect(parseResult.success).toBe(true);
    if (parseResult.success === true) {
      expect(parseResult.data.message).toBe(
        'The max votes for the ballot paper can not be lower than for any of the linked ballot paper sections.',
      );
    }
  });
  it('400: should return error because max votes per candidate is lower than associated ballot paper sections', async () => {
    const res = await request(app)
      .put(requestPath)
      .set('Authorization', `Bearer ${tokens.accessToken}`)
      .send({
        ...demoBallotPaper2,
        maxVotesPerCandidate: demoBallotPaperSection.maxVotesPerCandidate - 1,
      });
    expect(res.status).toBe(HttpStatusCode.badRequest);
    expect(res.type).toBe('application/json');
    const parseResult = response400Object.safeParse(res.body);
    expect(parseResult.success).toBe(true);
    if (parseResult.success === true) {
      expect(parseResult.data.message).toBe(
        'The max votes per candidate for the ballot paper can not be lower than for any of the linked ballot paper sections.',
      );
    }
  });
});
