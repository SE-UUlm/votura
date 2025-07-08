import {
  parameter,
  response400Object,
  selectableBallotPaperSectionObject,
} from '@repo/votura-validators';
import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';
import { app } from '../../src/app.js';
import { HttpStatusCode } from '../../src/httpStatusCode.js';
import { createUser, findUserBy } from '../../src/services/users.service.js';
import {
  brokenBallotPaperSection,
  DEMO_TOKEN,
  demoBallotPaper,
  demoBallotPaperSection,
  demoElection,
  demoUser,
} from '../mockData.js';
import { createBallotPaper } from './../../src/services/ballotPapers.service.js';
import { createElection } from './../../src/services/elections.service.js';

describe(`POST /:${parameter.electionId}/ballotPapers/:${parameter.ballotPaperId}/ballotPaperSections`, () => {
  let requestPath = '';

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
  });

  it('200: should create a ballot paper section', async () => {
    const res = await request(app)
      .post(requestPath)
      .set('Authorization', DEMO_TOKEN)
      .send(demoBallotPaperSection);
    expect(res.status).toBe(HttpStatusCode.created);
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
      .set('Authorization', DEMO_TOKEN)
      .send(brokenBallotPaperSection);
    expect(res.status).toBe(HttpStatusCode.badRequest);
    expect(res.type).toBe('application/json');
    const parseResult = response400Object.safeParse(res.body);
    expect(parseResult.success).toBe(true);
  });
});
