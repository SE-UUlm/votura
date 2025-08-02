import {
  parameter,
  response403Object,
  selectableElectionObject,
  type ApiTokenUser,
  type SelectableElection,
} from '@repo/votura-validators';
import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';
import { app } from '../../src/app.js';
import { generateUserTokens } from '../../src/auth/utils.js';
import { HttpStatusCode } from '../../src/httpStatusCode.js';
import {
  CheckElectionIsValidErrors,
  getValidationErrorMessage,
} from '../../src/middlewares/pathParamChecks/electionChecks.js';
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
  pastElection as pastElectionData,
} from '../mockData.js';
import { sleep } from '../utils.js';
import { createElection } from './../../src/services/elections.service.js';

describe(`PUT /elections/:${parameter.electionId}/freeze`, () => {
  let validElectionRequestPath = '';
  let pastElectionRequestPath = '';
  let emptyElectionRequestPath = '';
  let noSectionsElectionRequestPath = '';
  let noCandidatesElectionRequestPath = '';
  let additionalCandidateElectionRequestPath = '';
  let validElection: SelectableElection | null = null;
  let tokens: ApiTokenUser = { accessToken: '', refreshToken: '' };
  let noSectionsBPId: string | null = null;
  let noCandidatesBPSId: string | null = null;

  beforeAll(async () => {
    await createUser(demoUser);
    const user = await findUserBy({ email: demoUser.email });
    if (user === null) {
      throw new Error('Failed to find test user');
    }

    // Create a valid election with a ballot paper, section, and candidate
    validElection = await createElection(demoElection, user.id);
    const ballotPaper = await createBallotPaper(demoBallotPaper, validElection.id);
    const ballotPaperSection = await createBallotPaperSection(
      demoBallotPaperSection,
      ballotPaper.id,
    );
    const candidate = await createCandidate(demoCandidate, validElection.id);
    await addCandidateToBallotPaperSection(ballotPaperSection.id, candidate.id);

    // Create an election for which the voting date is in the past
    const pastElection = await createElection(pastElectionData, user.id);

    // Create an election with no ballot papers
    const emptyElection = await createElection(demoElection, user.id);

    // Create an election with a ballot paper but no section
    const noSectionsElection = await createElection(demoElection, user.id);
    noSectionsBPId = (await createBallotPaper(demoBallotPaper, noSectionsElection.id)).id;

    // Create an election with a ballot paper and section but no candidates linked to the section
    const noCandidatesElection = await createElection(demoElection, user.id);
    const noCandidatesBallotPaper = await createBallotPaper(
      demoBallotPaper,
      noCandidatesElection.id,
    );
    noCandidatesBPSId = (
      await createBallotPaperSection(demoBallotPaperSection, noCandidatesBallotPaper.id)
    ).id;

    // Create an election with a ballot paper, section and candidate linked to the section but an additional candidate linked to the election
    const additionalCandidateElection = await createElection(demoElection, user.id);
    const additionalCandidateBallotPaper = await createBallotPaper(
      demoBallotPaper,
      additionalCandidateElection.id,
    );
    const additionalCandidateBallotPaperSection = await createBallotPaperSection(
      demoBallotPaperSection,
      additionalCandidateBallotPaper.id,
    );
    const normalCandidate = await createCandidate(demoCandidate, additionalCandidateElection.id);
    await createCandidate(
      // additional candidate only linked to the election
      { ...demoCandidate, title: 'Additional Candidate' },
      additionalCandidateElection.id,
    );
    await addCandidateToBallotPaperSection(
      additionalCandidateBallotPaperSection.id,
      normalCandidate.id,
    );

    validElectionRequestPath = `/elections/${validElection.id}/freeze`;
    pastElectionRequestPath = `/elections/${pastElection.id}/freeze`;
    emptyElectionRequestPath = `/elections/${emptyElection.id}/freeze`;
    noSectionsElectionRequestPath = `/elections/${noSectionsElection.id}/freeze`;
    noCandidatesElectionRequestPath = `/elections/${noCandidatesElection.id}/freeze`;
    additionalCandidateElectionRequestPath = `/elections/${additionalCandidateElection.id}/freeze`;

    tokens = generateUserTokens(user.id);
  });

  it('200: should freeze an election & generate keys', { timeout: 120000 }, async () => {
    const res = await request(app)
      .put(validElectionRequestPath)
      .set('Authorization', `Bearer ${tokens.accessToken}`);
    expect(res.status).toBe(HttpStatusCode.ok);
    expect(res.type).toBe('application/json');
    let parseResult = selectableElectionObject.safeParse(res.body);
    expect(parseResult.success).toBe(true);

    expect(parseResult.data?.id).toBe(validElection?.id);
    expect(parseResult.data?.configFrozen).toBe(true);

    while (parseResult.data?.pubKey === undefined) {
      await sleep(5000);
      const res2 = await request(app)
        .get(`/elections/${validElection?.id}`)
        .set('Authorization', `Bearer ${tokens.accessToken}`);
      parseResult = selectableElectionObject.safeParse(res2.body);
    }

    expect(parseResult.data?.pubKey).toBeTypeOf('string');
    expect(parseResult.data?.primeP).toBeTypeOf('string');
    expect(parseResult.data?.primeQ).toBeTypeOf('string');
    expect(parseResult.data?.generator).toBeTypeOf('string');
  });
  it('403: should not allow freezing a second time', async () => {
    const res = await request(app)
      .put(validElectionRequestPath)
      .set('Authorization', `Bearer ${tokens.accessToken}`);
    expect(res.status).toBe(HttpStatusCode.forbidden);
    expect(res.type).toBe('application/json');
    const parseResult = response403Object.safeParse(res.body);
    expect(parseResult.success).toBe(true);
  });
  it('403: should not allow freezing a past election', async () => {
    const res = await request(app)
      .put(pastElectionRequestPath)
      .set('Authorization', `Bearer ${tokens.accessToken}`);
    expect(res.status).toBe(HttpStatusCode.forbidden);
    expect(res.type).toBe('application/json');
    const parseResult = response403Object.safeParse(res.body);
    expect(parseResult.success).toBe(true);
  });
  it('403: should not allow freezing an election with no ballot papers', async () => {
    const res = await request(app)
      .put(emptyElectionRequestPath)
      .set('Authorization', `Bearer ${tokens.accessToken}`);

    expect(res.status).toBe(HttpStatusCode.forbidden);
    expect(res.type).toBe('application/json');
    const parseResult = response403Object.safeParse(res.body);
    expect(parseResult.success).toBe(true);
    expect(parseResult.data?.message).toBe(
      getValidationErrorMessage(CheckElectionIsValidErrors.noBallotPapers),
    );
  });
  it('403: should not allow freezing an election with no ballot paper sections', async () => {
    if (noSectionsBPId === null) {
      throw new Error('No ballot paper ID set for no sections election');
    }
    const res = await request(app)
      .put(noSectionsElectionRequestPath)
      .set('Authorization', `Bearer ${tokens.accessToken}`);

    expect(res.status).toBe(HttpStatusCode.forbidden);
    expect(res.type).toBe('application/json');
    const parseResult = response403Object.safeParse(res.body);
    expect(parseResult.success).toBe(true);
    expect(parseResult.data?.message).toBe(
      getValidationErrorMessage(CheckElectionIsValidErrors.noSections, noSectionsBPId),
    );
  });
  it('403: should not allow freezing an election with no candidates linked to ballot paper sections', async () => {
    if (noCandidatesBPSId === null) {
      throw new Error('No ballot paper section ID set for no section candidates election');
    }
    const res = await request(app)
      .put(noCandidatesElectionRequestPath)
      .set('Authorization', `Bearer ${tokens.accessToken}`);

    expect(res.status).toBe(HttpStatusCode.forbidden);
    expect(res.type).toBe('application/json');
    const parseResult = response403Object.safeParse(res.body);
    expect(parseResult.success).toBe(true);
    expect(parseResult.data?.message).toBe(
      getValidationErrorMessage(CheckElectionIsValidErrors.noCandidates, noCandidatesBPSId),
    );
  });
  it('403: should not allow freezing an election with candidates linked to the election but not to ballot paper sections', async () => {
    const res = await request(app)
      .put(additionalCandidateElectionRequestPath)
      .set('Authorization', `Bearer ${tokens.accessToken}`);

    expect(res.status).toBe(HttpStatusCode.forbidden);
    expect(res.type).toBe('application/json');
    const parseResult = response403Object.safeParse(res.body);
    expect(parseResult.success).toBe(true);
    expect(parseResult.data?.message).toBe(
      getValidationErrorMessage(CheckElectionIsValidErrors.candidateMismatch),
    );
  });
});
