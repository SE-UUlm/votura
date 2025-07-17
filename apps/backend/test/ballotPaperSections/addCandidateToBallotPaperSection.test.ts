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
  demoCandidate2,
  demoElection,
  demoElection2,
  demoUser,
} from '../mockData.js';
import { createBallotPaper } from './../../src/services/ballotPapers.service.js';
import { createBallotPaperSection } from './../../src/services/ballotPaperSections.service.js';
import { createCandidate } from './../../src/services/candidates.service.js';
import { createElection } from './../../src/services/elections.service.js';

describe(`PUT /:${parameter.electionId}/ballotPapers/:${parameter.ballotPaperId}/ballotPaperSections/:${parameter.ballotPaperSectionId}/candidates`, () => {
  let requestPath = '';
  let tokens: ApiTokenUser = { accessToken: '', refreshToken: '' };
  let candidate: SelectableCandidate | null = null;
  let candidate2: SelectableCandidate | null = null;
  let ballotPaperSection: SelectableBallotPaperSection | null = null;

  beforeAll(async () => {
    await createUser(demoUser);
    const user = await findUserBy({ email: demoUser.email });
    if (user === null) {
      throw new Error('Failed to find test user');
    }

    const election = await createElection(demoElection, user.id);
    const election2 = await createElection(demoElection2, user.id);

    const ballotPaper = await createBallotPaper(demoBallotPaper, election.id);

    ballotPaperSection = await createBallotPaperSection(demoBallotPaperSection, ballotPaper.id);

    candidate = await createCandidate(demoCandidate, election.id);
    candidate2 = await createCandidate(demoCandidate2, election2.id);

    requestPath = `/elections/${election.id}/ballotPapers/${ballotPaper.id}/ballotPaperSections/${ballotPaperSection.id}/candidates/`;

    tokens = generateUserTokens(user.id);
  });

  it('200: should add a candidate to a ballot paper section', async () => {
    const res = await request(app)
      .put(requestPath)
      .set('Authorization', `Bearer ${tokens.accessToken}`)
      .send({ candidateId: candidate?.id });

    expect(res.status).toBe(HttpStatusCode.ok);
    expect(res.type).toBe('application/json');
    const { data, success } = selectableBallotPaperSectionObject.safeParse(res.body);
    expect(success).toBe(true);
    if (success) {
      expect(data.id).toBe(ballotPaperSection?.id);
      expect(data.candidateIds).toContain(candidate?.id);
    }
  });
  it('400: should return error for invalid request body', async () => {
    const res = await request(app)
      .put(requestPath)
      .set('Authorization', `Bearer ${tokens.accessToken}`)
      .send({ candidateId: 'invalid-uuid' });

    expect(res.status).toBe(HttpStatusCode.badRequest);
    expect(res.type).toBe('application/json');
    const parseResult = response400Object.safeParse(res.body);
    expect(parseResult.success).toBe(true);
  });
  it('404: should return error for non-existing candidate', async () => {
    const res = await request(app)
      .put(requestPath)
      .set('Authorization', `Bearer ${tokens.accessToken}`)
      .send({ candidateId: '1d88b483-cf68-42ef-9f1c-3bb6eea314f8' }); // valid UUID but non-existing candidate

    expect(res.status).toBe(HttpStatusCode.notFound);
    expect(res.type).toBe('application/json');
    const parseResult = response404Object.safeParse(res.body);
    expect(parseResult.success).toBe(true);
    expect(parseResult.data?.message).toBe('The provided candidate does not exist!');
  });
  it('400: should return error for candidate not linked to election', async () => {
    const res = await request(app)
      .put(requestPath)
      .set('Authorization', `Bearer ${tokens.accessToken}`)
      .send({ candidateId: candidate2?.id });

    expect(res.status).toBe(HttpStatusCode.badRequest);
    expect(res.type).toBe('application/json');
    const parseResult = response400Object.safeParse(res.body);
    expect(parseResult.success).toBe(true);
    expect(parseResult.data?.message).toBe(
      'The provided candidate does not belong to the provided election.',
    );
  });
});
