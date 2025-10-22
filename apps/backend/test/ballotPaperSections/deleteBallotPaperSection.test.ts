import {
  parameter,
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
import { demoBallotPaper, demoBallotPaperSection, demoElection, demoUser } from '../mockData.js';
import { createBallotPaper } from './../../src/services/ballotPapers.service.js';
import {
  createBallotPaperSection,
  getBallotPaperSection,
} from './../../src/services/ballotPaperSections.service.js';
import { createElection } from './../../src/services/elections.service.js';

describe(`DEL /elections/:${parameter.electionId}/ballotPapers/:${parameter.ballotPaperId}/ballotPaperSections/:${parameter.ballotPaperSectionId}`, () => {
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
    ballotPaper = await createBallotPaper(demoBallotPaper, election.id);
    ballotPaperSection = await createBallotPaperSection(demoBallotPaperSection, ballotPaper.id);

    requestPath = `/elections/${election.id}/ballotPapers/${ballotPaper.id}/ballotPaperSections/${ballotPaperSection.id}`;
    tokens = generateUserTokens(user.id);
  });
  it('203: should delete a ballot paper section', async () => {
    const res = await request(app)
      .delete(requestPath)
      .set('Authorization', `Bearer ${tokens.accessToken}`);
    expect(res.status).toBe(HttpStatusCode.noContent);
    if (ballotPaperSection?.id === undefined) {
      throw new Error('Ballot paper section ID is undefined');
    }
    await expect(getBallotPaperSection(ballotPaperSection.id)).rejects.toThrow();
  });
});
