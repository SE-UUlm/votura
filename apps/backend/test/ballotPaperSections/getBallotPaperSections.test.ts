import {
  parameter,
  selectableBallotPaperSectionObject,
  type ApiTokenUser,
} from '@repo/votura-validators';
import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';
import { app } from '../../src/app.js';
import { generateUserTokens } from '../../src/auth/utils.js';
import { HttpStatusCode } from '../../src/httpStatusCode.js';
import { createBallotPaperSection } from '../../src/services/ballotPaperSections.service.js';
import { createUser, findUserBy } from '../../src/services/users.service.js';
import {
  demoBallotPaper,
  demoBallotPaperSection,
  demoBallotPaperSection2,
  demoElection,
  demoUser,
} from '../mockData.js';
import { createBallotPaper } from './../../src/services/ballotPapers.service.js';
import { createElection } from './../../src/services/elections.service.js';

describe(`POST /elections/:${parameter.electionId}/ballotPapers`, () => {
  let requestPath = '';
  let tokens: ApiTokenUser = { accessToken: '', refreshToken: '' };

  beforeAll(async () => {
    await createUser(demoUser);
    const user = await findUserBy({ email: demoUser.email });
    if (user === null) {
      throw new Error('Failed to find test user');
    }

    const election = await createElection(demoElection, user.id);
    const ballotPaper = await createBallotPaper(demoBallotPaper, election.id);
    await createBallotPaperSection(demoBallotPaperSection, ballotPaper.id);
    await createBallotPaperSection(demoBallotPaperSection2, ballotPaper.id);

    requestPath = `/elections/${election.id}/ballotPapers/${ballotPaper.id}/ballotPaperSections`;

    tokens = generateUserTokens(user.id);
  });

  it('200: should get all ballot papers sections for an election', async () => {
    const res = await request(app)
      .get(requestPath)
      .set('Authorization', `Bearer ${tokens.accessToken}`);
    expect(res.status).toBe(HttpStatusCode.ok);
    expect(res.type).toBe('application/json');

    const arrBody = res.body as unknown[];
    expect(arrBody).toBeInstanceOf(Array);
    expect(arrBody.length).toBe(2);

    const ballotPaperSections = await Promise.all(
      arrBody.map((ballotPaperSection) =>
        selectableBallotPaperSectionObject.safeParseAsync(ballotPaperSection),
      ),
    );

    ballotPaperSections.forEach((ballotPaperSection) => {
      expect(ballotPaperSection.success).toBe(true);
    });
  });
});
