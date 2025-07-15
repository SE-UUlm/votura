import {
  parameter,
  response400Object,
  response404Object,
  selectableBallotPaperSectionObject,
  type ApiTokenUser,
  type SelectableBallotPaperSection,
  type SelectableCandidate,
} from '@repo/votura-validators';
import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';
import { app } from '../../src/app.js';
import { generateUserTokens } from '../../src/auth/utils.js';
import { HttpStatusCode } from '../../src/httpStatusCode.js';
import { createUser, findUserBy } from '../../src/services/users.service.js';
import {
  demoBallotPaper,
  demoBallotPaperSection,
  demoCandidate,
  demoElection,
  demoUser,
} from '../mockData.js';
import { createBallotPaper } from './../../src/services/ballotPapers.service.js';
import {
  addCandidateToBallotPaperSection,
  createBallotPaperSection,
} from './../../src/services/ballotPaperSections.service.js';
import { createCandidate } from './../../src/services/candidates.service.js';
import { createElection } from './../../src/services/elections.service.js';

describe(`DEL /:${parameter.electionId}/ballotPapers/:${parameter.ballotPaperId}/ballotPaperSections/:${parameter.ballotPaperSectionId}/candidates`, () => {
  let requestPath = '';
  let tokens: ApiTokenUser = { accessToken: '', refreshToken: '' };
  let candidate: SelectableCandidate | null = null;
  let ballotPaperSection: SelectableBallotPaperSection | null = null;

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

    ballotPaperSection = await createBallotPaperSection(demoBallotPaperSection, ballotPaper.id);
    if (ballotPaperSection === null) {
      throw new Error('Failed to create test ballot paper section');
    }

    candidate = await createCandidate(demoCandidate, election.id);
    if (candidate === null) {
      throw new Error('Failed to create test candidate');
    }

    const addCandidateResult = await addCandidateToBallotPaperSection(
      ballotPaperSection.id,
      candidate.id,
    );
    // check if addCandidateResult is type of SelectableBallotPaperSection
    if (typeof addCandidateResult === 'string') {
      throw new Error(`Failed to add candidate to ballot paper section`);
    }
    ballotPaperSection = addCandidateResult;

    requestPath = `/elections/${election.id}/ballotPapers/${ballotPaper.id}/ballotPaperSections/${ballotPaperSection.id}/candidates/`;

    tokens = generateUserTokens(user.id);
  });

  it('400: should return error for invalid request body', async () => {
    const res = await request(app)
      .del(requestPath)
      .set('Authorization', `Bearer ${tokens.accessToken}`)
      .send({ candidateId: 'invalid-uuid' });

    expect(res.status).toBe(HttpStatusCode.badRequest);
    expect(res.type).toBe('application/json');
    const parseResult = response400Object.safeParse(res.body);
    expect(parseResult.success).toBe(true);
  });
  it('404: should return error for non-existing candidate', async () => {
    const res = await request(app)
      .del(requestPath)
      .set('Authorization', `Bearer ${tokens.accessToken}`)
      .send({ candidateId: '1d88b483-cf68-42ef-9f1c-3bb6eea314f8' }); // valid UUID but non-existing candidate

    expect(res.status).toBe(HttpStatusCode.notFound);
    expect(res.type).toBe('application/json');
    const parseResult = response404Object.safeParse(res.body);
    expect(parseResult.success).toBe(true);
    expect(parseResult.data?.message).toBe('Candidate not found');
  });
  it('200: should remove a candidate from a ballot paper section', async () => {
    //make sure candidate exists in the ballot paper section
    expect(ballotPaperSection?.candidateIds).toContain(candidate?.id);

    const res = await request(app)
      .del(requestPath)
      .set('Authorization', `Bearer ${tokens.accessToken}`)
      .send({ candidateId: candidate?.id });

    expect(res.status).toBe(HttpStatusCode.ok);
    expect(res.type).toBe('application/json');
    const { data, success } = selectableBallotPaperSectionObject.safeParse(res.body);
    expect(success).toBe(true);
    if (success) {
      expect(data.id).toBe(ballotPaperSection?.id);
      expect(data.candidateIds).not.toContain(candidate?.id);
    }
  });
  it('404: should return error for unlinked candidate', async () => {
    const res = await request(app)
      .del(requestPath)
      .set('Authorization', `Bearer ${tokens.accessToken}`)
      .send({ candidateId: candidate?.id }); // candidate already removed

    expect(res.status).toBe(HttpStatusCode.notFound);
    expect(res.type).toBe('application/json');
    const parseResult = response404Object.safeParse(res.body);
    expect(parseResult.success).toBe(true);
    expect(parseResult.data?.message).toBe('Candidate not linked to ballot paper section');
  });
});
