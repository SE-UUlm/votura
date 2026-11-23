import { db } from '@repo/db';
import {
  parameter,
  response400Object,
  response404Object,
  selectableElectionResultObject,
  type SelectableElection,
} from '@repo/votura-validators';
import { getKeyPair } from '@votura/votura-crypto/index';
import { randomUUID } from 'crypto';
import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';
import { app } from '../../src/app.js';
import { generateUserTokens } from '../../src/auth/utils.js';
import { HttpStatusCode } from '../../src/httpStatusCode.js';
import { createBallotPaper } from '../../src/services/ballotPapers.service.js';
import {
  addCandidateToBallotPaperSection,
  createBallotPaperSection,
} from '../../src/services/ballotPaperSections.service.js';
import { createCandidate } from '../../src/services/candidates.service.js';
import { createUser, findUserBy } from '../../src/services/users.service.js';
import {
  demoBallotPaper,
  demoBallotPaperSection,
  demoCandidate,
  demoElection,
  demoUser,
} from '../mockData.js';
import {
  createElection,
  freezeElection as freezeElectionService,
  setElectionKeys,
} from './../../src/services/elections.service.js';

describe(`GET /results/:${parameter.electionId}`, () => {
  let publishedElection: SelectableElection | null = null;
  let unpublishedElection: SelectableElection | null = null;
  let publishedResult: unknown = null;

  beforeAll(async () => {
    await createUser(demoUser);
    const user = await findUserBy({ email: demoUser.email });
    if (user === null) {
      throw new Error('Failed to find test user');
    }

    publishedElection = await createElection(demoElection, user.id);
    const ballotPaper = await createBallotPaper(demoBallotPaper, publishedElection.id);
    const section = await createBallotPaperSection(demoBallotPaperSection, ballotPaper.id);
    const candidate = await createCandidate(demoCandidate, publishedElection.id);
    await addCandidateToBallotPaperSection(section.id, candidate.id);

    // Freeze the election with keys and move the voting period into the past
    const { keyGenStartedAt } = await freezeElectionService(publishedElection.id);
    await setElectionKeys(await getKeyPair(20), publishedElection.id, keyGenStartedAt);
    await db
      .updateTable('election')
      .set({
        votingStartAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        votingEndAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
      })
      .where('id', '=', publishedElection.id)
      .execute();

    const tokens = generateUserTokens(user.id);
    const publishRes = await request(app)
      .put(`/elections/${publishedElection.id}/publishResults`)
      .set('Authorization', `Bearer ${tokens.accessToken}`);
    if (!selectableElectionResultObject.safeParse(publishRes.body).success) {
      throw new Error('Failed to publish the election results');
    }
    publishedResult = publishRes.body;

    unpublishedElection = await createElection(demoElection, user.id);
  });

  it('200: should return the published results without authentication', async () => {
    const res = await request(app).get(`/results/${publishedElection?.id}`);
    expect(res.status).toBe(HttpStatusCode.ok);
    expect(res.type).toBe('application/json');
    const parseResult = selectableElectionResultObject.safeParse(res.body);
    expect(parseResult.success).toBe(true);
    expect(res.body).toEqual(publishedResult);
    expect(parseResult.data?.ballotPapers[0]?.ballotsCast).toBe(0);
  });
  it('404: should not return results that are not published', async () => {
    const res = await request(app).get(`/results/${unpublishedElection?.id}`);
    expect(res.status).toBe(HttpStatusCode.notFound);
    expect(res.type).toBe('application/json');
    expect(response404Object.safeParse(res.body).success).toBe(true);
  });
  it('404: should not return results of an election that does not exist', async () => {
    const res = await request(app).get(`/results/${randomUUID()}`);
    expect(res.status).toBe(HttpStatusCode.notFound);
    expect(res.type).toBe('application/json');
    expect(response404Object.safeParse(res.body).success).toBe(true);
  });
  it('400: should not accept an invalid election id', async () => {
    const res = await request(app).get('/results/not-a-uuid');
    expect(res.status).toBe(HttpStatusCode.badRequest);
    expect(res.type).toBe('application/json');
    expect(response400Object.safeParse(res.body).success).toBe(true);
  });
});
