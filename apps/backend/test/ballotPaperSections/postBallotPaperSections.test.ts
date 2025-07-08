import {
  parameter,
  response400Object,
  selectableBallotPaperSectionObject,
  type ApiTokenUser,
} from '@repo/votura-validators';
import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';
import { app } from '../../src/app.js';
import { generateUserTokens } from '../../src/auth/utils.js';
import { HttpStatusCode } from '../../src/httpStatusCode.js';
import { createUser, findUserBy } from '../../src/services/users.service.js';
import {
  brokenBallotPaperSection,
  demoBallotPaper,
  demoBallotPaperSection,
  demoElection,
  demoUser,
} from '../mockData.js';
import { createBallotPaper } from './../../src/services/ballotPapers.service.js';
import { createElection } from './../../src/services/elections.service.js';

describe(`POST /elections/:${parameter.electionId}/ballotPapers/:${parameter.ballotPaperId}/ballotPaperSections`, () => {
  let requestPath = '';
  let tokens: ApiTokenUser = { accessToken: '', refreshToken: '' };

  beforeAll(async () => {
    await createUser(demoUser);
    const user = await findUserBy({ email: demoUser.email });
    if (user === null) {
      throw new Error('Failed to find test user');
    }

    const election = await createElection(demoElection, user.id);
    if (election === null) {
      throw new Error('Failed to create test election');
    }

    const ballotPaper = await createBallotPaper(demoBallotPaper, election.id);
    if (ballotPaper === null) {
      throw new Error('Failed to create test ballot paper');
    }

    requestPath = `/elections/${election.id}/ballotPapers/${ballotPaper.id}/ballotPaperSections`;

    tokens = generateUserTokens(user.id);
  });

  it('200: should create a ballot paper section', async () => {
    const res = await request(app)
      .post(requestPath)
      .set('Authorization', `Bearer ${tokens.accessToken}`)
      .send(demoBallotPaperSection);
    expect(res.status).toBe(HttpStatusCode.Created);
    expect(res.type).toBe('application/json');
    const parseResult = selectableBallotPaperSectionObject.safeParse(res.body);
    expect(parseResult.success).toBe(true);
    if (parseResult.success === true) {
      expect(parseResult.data.name).toBe(demoBallotPaperSection.name);
      expect(parseResult.data.description).toBe(demoBallotPaperSection.description);
      expect(parseResult.data.maxVotes).toBe(demoBallotPaperSection.maxVotes);
      expect(parseResult.data.maxVotesPerCandidate).toBe(
        demoBallotPaperSection.maxVotesPerCandidate,
      );
    }
  });
  it('400: should throw error missing fields', async () => {
    const res = await request(app)
      .post(requestPath)
      .set('Authorization', `Bearer ${tokens.accessToken}`)
      .send(brokenBallotPaperSection);
    expect(res.status).toBe(HttpStatusCode.BadRequest);
    expect(res.type).toBe('application/json');
    const parseResult = response400Object.safeParse(res.body);
    expect(parseResult.success).toBe(true);
  });
});
