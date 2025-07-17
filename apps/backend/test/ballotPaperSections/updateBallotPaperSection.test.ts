import {
  parameter,
  response400Object,
  response404Object,
  selectableBallotPaperSectionObject,
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
  brokenBallotPaperSection,
  demoBallotPaper,
  demoBallotPaper2,
  demoBallotPaperSection,
  demoBallotPaperSection2,
  demoElection,
  demoUser,
  demoUser2,
} from '../mockData.js';
import { createBallotPaper } from './../../src/services/ballotPapers.service.js';
import { createBallotPaperSection } from './../../src/services/ballotPaperSections.service.js';
import { createElection } from './../../src/services/elections.service.js';

describe(`PUT /elections/:${parameter.electionId}/ballotPapers/:${parameter.ballotPaperId}/ballotPaperSections/:${parameter.ballotPaperSectionId}`, () => {
  let requestPath = '';
  let invalidUuidRequestPath = '';
  let notExistingRequestPath = '';
  let wrongParentPath = '';
  let election: SelectableElection | null = null;
  let ballotPaper: SelectableBallotPaper | null = null;
  let ballotPaperSection: SelectableBallotPaperSection | null = null;
  let tokens: ApiTokenUser = { accessToken: '', refreshToken: '' };

  beforeAll(async () => {
    await createUser(demoUser);
    await createUser(demoUser2);
    const user = await findUserBy({ email: demoUser.email });
    const user2 = await findUserBy({ email: demoUser2.email });
    if (user === null || user2 === null) {
      throw new Error('Failed to find test user');
    }

    election = await createElection(demoElection, user.id);
    if (election === null) {
      throw new Error('Failed to create test election');
    }

    ballotPaper = await createBallotPaper(demoBallotPaper, election.id);
    const ballotPaper2 = await createBallotPaper(demoBallotPaper2, election.id);
    if (ballotPaper === null || ballotPaper2 === null) {
      throw new Error('Failed to create test ballot paper');
    }

    ballotPaperSection = await createBallotPaperSection(demoBallotPaperSection, ballotPaper.id);
    if (ballotPaperSection === null) {
      throw new Error('Failed to create test ballot paper section');
    }

    requestPath = `/elections/${election.id}/ballotPapers/${ballotPaper.id}/ballotPaperSections/${ballotPaperSection.id}`;
    invalidUuidRequestPath = `/elections/${election.id}/ballotPapers/${ballotPaper.id}/ballotPaperSections/No-UUID`;
    notExistingRequestPath = `/elections/${election.id}/ballotPapers/${ballotPaper.id}/ballotPaperSections/130b189b-0627-4dec-b928-169146a2931b`;
    wrongParentPath = `/elections/${election.id}/ballotPapers/${ballotPaper2.id}/ballotPaperSections/${ballotPaperSection.id}`;
    tokens = generateUserTokens(user.id);
  });

  it('200: should update a ballot paper section', async () => {
    const res = await request(app)
      .put(requestPath)
      .set('Authorization', `Bearer ${tokens.accessToken}`)
      .send(demoBallotPaperSection2);
    expect(res.status).toBe(HttpStatusCode.ok);
    expect(res.type).toBe('application/json');
    const parseResult = selectableBallotPaperSectionObject.safeParse(res.body);
    expect(parseResult.success).toBe(true);
    if (parseResult.success === true) {
      expect(parseResult.data.id).toBe(ballotPaperSection?.id);
      expect(parseResult.data.ballotPaperId).toBe(ballotPaper?.id);
      expect(parseResult.data.name).toBe(demoBallotPaperSection2.name);
      expect(parseResult.data.maxVotes).toBe(demoBallotPaperSection2.maxVotes);
      expect(parseResult.data.maxVotesPerCandidate).toBe(
        demoBallotPaperSection2.maxVotesPerCandidate,
      );
    }
  });
  it('400: should complain about wrong UUID', async () => {
    const res = await request(app)
      .put(invalidUuidRequestPath)
      .set('Authorization', `Bearer ${tokens.accessToken}`)
      .send(demoBallotPaperSection);
    expect(res.status).toBe(HttpStatusCode.badRequest);
    expect(res.type).toBe('application/json');
    const parseResult = response400Object.safeParse(res.body);
    expect(parseResult.success).toBe(true);
  });
  it('400: should complain about wrong input data', async () => {
    const res = await request(app)
      .put(requestPath)
      .set('Authorization', `Bearer ${tokens.accessToken}`)
      .send(brokenBallotPaperSection);
    expect(res.status).toBe(HttpStatusCode.badRequest);
    expect(res.type).toBe('application/json');
    const parseResult = response400Object.safeParse(res.body);
    expect(parseResult.success).toBe(true);
  });
  it('404: should complain about non-existing ballot paper section', async () => {
    const res = await request(app)
      .put(notExistingRequestPath)
      .set('Authorization', `Bearer ${tokens.accessToken}`)
      .send(demoBallotPaperSection);
    expect(res.status).toBe(HttpStatusCode.notFound);
    expect(res.type).toBe('application/json');
    const parseResult = response404Object.safeParse(res.body);
    expect(parseResult.success).toBe(true);
  });
  it('404: when BP is not the parent of BPS', async () => {
    const res = await request(app)
      .put(wrongParentPath)
      .set('Authorization', `Bearer ${tokens.accessToken}`)
      .send(demoBallotPaperSection);
    expect(res.status).toBe(HttpStatusCode.badRequest);
    expect(res.type).toBe('application/json');
    const parseResult = response400Object.safeParse(res.body);
    expect(parseResult.success).toBe(true);
  });
  it('400: should return error because updated max votes is higher than associated ballot paper', async () => {
    // checks to satisfy typechecker
    if (ballotPaper === null) {
      throw new Error('Failed to create test ballot paper');
    }
    if (ballotPaper.maxVotes === undefined) {
      throw new Error('Ballot paper maxVotes is undefined');
    }

    const res = await request(app)
      .put(requestPath)
      .set('Authorization', `Bearer ${tokens.accessToken}`)
      .send({
        ...demoBallotPaperSection,
        maxVotes: ballotPaper.maxVotes + 1,
      });
    expect(res.status).toBe(HttpStatusCode.badRequest);
    expect(res.type).toBe('application/json');
    const parseResult = response400Object.safeParse(res.body);
    expect(parseResult.success).toBe(true);
    if (parseResult.success === true) {
      expect(parseResult.data.message).toBe(
        'The max votes for the ballot paper section cannot be greater than the max votes of the ballot paper.',
      );
    }
  });
  it('400: should return error because updated max votes per candidate is higher than associated ballot paper', async () => {
    if (ballotPaper === null) {
      throw new Error('Failed to create test ballot paper');
    }
    if (ballotPaper.maxVotesPerCandidate === undefined) {
      throw new Error('Ballot paper maxVotesPerCandidate is undefined');
    }

    const res = await request(app)
      .put(requestPath)
      .set('Authorization', `Bearer ${tokens.accessToken}`)
      .send({
        ...demoBallotPaperSection,
        maxVotesPerCandidate: ballotPaper.maxVotesPerCandidate + 1,
      });
    expect(res.status).toBe(HttpStatusCode.badRequest);
    expect(res.type).toBe('application/json');
    const parseResult = response400Object.safeParse(res.body);
    expect(parseResult.success).toBe(true);
    if (parseResult.success === true) {
      expect(parseResult.data.message).toBe(
        'The max votes per candidate for the ballot paper section cannot be greater than the max votes per candidate of the ballot paper.',
      );
    }
  });
});
