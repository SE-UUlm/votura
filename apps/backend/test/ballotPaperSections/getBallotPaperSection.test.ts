import {
  parameter,
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
import { demoBallotPaper, demoBallotPaperSection, demoElection, demoUser } from '../mockData.js';
import { createBallotPaper } from './../../src/services/ballotPapers.service.js';
import { createBallotPaperSection } from './../../src/services/ballotPaperSections.service.js';
import { createElection } from './../../src/services/elections.service.js';

describe(`GET /elections/:${parameter.electionId}/ballotPapers/:${parameter.ballotPaperId}/ballotPaperSections/:${parameter.ballotPaperSectionId}`, () => {
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

    requestPath = `/elections/${election.id}/ballotPapers/${ballotPaper.id}/ballotPaperSections/${ballotPaperSection.id}`;
    tokens = generateUserTokens(user.id);
  });

  it('200: should get a ballot paper section for an election', async () => {
    const res = await request(app).get(requestPath).set('Authorization', tokens.accessToken);
    expect(res.status).toBe(HttpStatusCode.Ok);
    expect(res.type).toBe('application/json');
    const parseResult = selectableBallotPaperSectionObject.safeParse(res.body);
    expect(parseResult.success).toBe(true);
    if (parseResult.success === true) {
      expect(parseResult.data.id).toBe(ballotPaperSection?.id);
      expect(parseResult.data.ballotPaperId).toBe(ballotPaper?.id);
      expect(parseResult.data.name).toBe(demoBallotPaperSection.name);
      expect(parseResult.data.maxVotesPerCandidate).toBe(
        demoBallotPaperSection.maxVotesPerCandidate,
      );
      expect(parseResult.data.maxVotes).toBe(demoBallotPaperSection.maxVotes);
      expect(parseResult.data.description).toBe(demoBallotPaperSection.description);
    }
  });
});
