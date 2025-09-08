import {
  parameter,
  selectableElectionObject,
  type ApiTokenUser,
  type SelectableElection,
  type SelectableVoterGroup,
} from '@repo/votura-validators';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';
import { app } from '../../src/app.js';
import { JWT_CONFIG } from '../../src/auth/jwtConfig.js';
import { generateUserTokens } from '../../src/auth/utils.js';
import { HttpStatusCode } from '../../src/httpStatusCode.js';
import { createUser, findUserBy } from '../../src/services/users.service.js';
import {
  demoBallotPaper,
  demoBallotPaperSection,
  demoCandidate,
  demoElection,
  demoUser,
  voterGroupNoBallotPapers,
} from '../mockData.js';
import { sleep } from '../utils.js';
import { createBallotPaper } from './../../src/services/ballotPapers.service.js';
import {
  addCandidateToBallotPaperSection,
  createBallotPaperSection,
} from './../../src/services/ballotPaperSections.service.js';
import { createCandidate } from './../../src/services/candidates.service.js';
import { createElection } from './../../src/services/elections.service.js';
import { createVoterGroup, getVoterGroupPubKey } from './../../src/services/voterGroups.service.js';

describe(`GET /voterGroups/:${parameter.voterGroupId}/createVoterTokens`, () => {
  let requestPath = '';
  let tokens: ApiTokenUser = { accessToken: '', refreshToken: '' };
  const verifyOptions: jwt.VerifyOptions = {
    algorithms: [JWT_CONFIG.algorithm],
  };
  let election: SelectableElection | null = null;
  let voterGroup: SelectableVoterGroup | null = null;

  beforeAll(async () => {
    await createUser(demoUser);
    const user = await findUserBy({ email: demoUser.email });
    if (user === null) {
      throw new Error('Failed to find test user 1');
    }
    election = await createElection(demoElection, user.id);
    const ballotPaper = await createBallotPaper(demoBallotPaper, election.id);
    const ballotPaperSection = await createBallotPaperSection(
      demoBallotPaperSection,
      ballotPaper.id,
    );
    const candidate = await createCandidate(demoCandidate, election.id);
    await addCandidateToBallotPaperSection(ballotPaperSection.id, candidate.id);
    const demoVoterGroup = { ...voterGroupNoBallotPapers, ballotPapers: [ballotPaper.id] };
    voterGroup = await createVoterGroup(demoVoterGroup, user.id);

    tokens = generateUserTokens(user.id);

    requestPath = `/voterGroups/${voterGroup.id}/createVoterTokens`;
    const electionPath = `/elections/${election.id}`;
    const freezePath = `/elections/${election.id}/freeze`;

    // freeze the election
    let res = await request(app)
      .put(freezePath)
      .set('Authorization', `Bearer ${tokens.accessToken}`);
    let parseResult = selectableElectionObject.safeParse(res.body);
    if (!parseResult.success) {
      throw new Error('Failed to parse election 1');
    }

    // wait for the election to have a public key (prerequisite for creating voter tokens
    while (parseResult.data?.pubKey === undefined) {
      await sleep(5000);
      res = await request(app)
        .get(electionPath)
        .set('Authorization', `Bearer ${tokens.accessToken}`);
      parseResult = selectableElectionObject.safeParse(res.body);
      if (!parseResult.success) {
        throw new Error('Failed to parse election after waiting');
      }
    }
  }, 30000 /* 30 seconds */);

  it('200: should create the voter tokens for the voter group', async () => {
    const res = await request(app)
      .get(requestPath)
      .set('Authorization', `Bearer ${tokens.accessToken}`);

    expect(res.status).toBe(HttpStatusCode.ok);
    expect(res.type).toBe('application/json');
    expect(Array.isArray(res.body)).toBe(true);
    expect((res.body as unknown[]).length).toBe(voterGroupNoBallotPapers.numberOfVoters);

    if (!voterGroup) {
      throw new Error('Voter group is null');
    }
    const pubKey = await getVoterGroupPubKey(voterGroup.id);
    if (pubKey === null) {
      throw new Error('Public key for voter group is null');
    }

    for (const voterToken of res.body as string[]) {
      if (typeof voterToken === 'string') {
        jwt.verify(voterToken, pubKey, verifyOptions);
      } else {
        throw new Error('Token is undefined or not a string');
      }
    }
  });
});
