import { db } from '@repo/db';
import {
  parameter,
  selectableElectionObject,
  type ApiTokenUser,
  type SelectableElection,
} from '@repo/votura-validators';
import { getKeyPair } from '@votura/votura-crypto/index';
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
import { createVoterGroup, getVoterGroupPubKey } from '../../src/services/voterGroups.service.js';
import {
  demoBallotPaper,
  demoBallotPaperSection,
  demoCandidate,
  demoElection,
  demoUser,
  voterGroupNoBallotPapers,
} from '../mockData.js';
import { sleep } from '../utils.js';
import {
  createElection,
  freezeElection as freezeElectionService,
  setElectionKeys,
  unfreezeElection as unfreezeElectionService,
} from './../../src/services/elections.service.js';

/**
 * Puts the election into a defined key generation state directly in the database.
 * This avoids racing against the real (asynchronous) key generation process.
 */
const setKeyGenState = async (
  electionId: SelectableElection['id'],
  keyGenStartedAt: Date | null,
): Promise<void> => {
  await db
    .updateTable('election')
    .set({
      configFrozen: true,
      pubKey: null,
      privKey: null,
      primeP: null,
      primeQ: null,
      generator: null,
      keyGenStartedAt,
    })
    .where('id', '=', electionId)
    .execute();
};

describe(`PUT /elections/:${parameter.electionId}/unfreeze`, () => {
  let freezePath = '';
  let unfreezePath = '';
  let voterTokensPath = '';
  let election: SelectableElection | null = null;
  let tokens: ApiTokenUser = { accessToken: '', refreshToken: '' };
  let voterGroupId = '';

  beforeAll(async () => {
    await createUser(demoUser);
    const user = await findUserBy({ email: demoUser.email });
    if (user === null) {
      throw new Error('Failed to find test user');
    }

    election = await createElection(demoElection, user.id);
    const ballotPaper = await createBallotPaper(demoBallotPaper, election.id);
    const ballotPaperSection = await createBallotPaperSection(
      demoBallotPaperSection,
      ballotPaper.id,
    );
    const candidate = await createCandidate(demoCandidate, election.id);
    await addCandidateToBallotPaperSection(ballotPaperSection.id, candidate.id);
    const voterGroup = await createVoterGroup(
      {
        ...voterGroupNoBallotPapers,
        ballotPapers: [ballotPaper.id],
      },
      user.id,
    );
    voterGroupId = voterGroup.id;

    freezePath = `/elections/${election.id}/freeze`;
    unfreezePath = `/elections/${election.id}/unfreeze`;
    voterTokensPath = `/voterGroups/${voterGroupId}/createVoterTokens`;

    tokens = generateUserTokens(user.id);
  });

  it(
    '200: should unfreeze a frozen election and delete the pubKey of linked voter groups',
    { timeout: 120000 },
    async () => {
      const res1 = await request(app)
        .put(freezePath)
        .set('Authorization', `Bearer ${tokens.accessToken}`);
      let parseResult = selectableElectionObject.safeParse(res1.body);

      // wait until the election has a pubKey (prerequisite for getting voter tokens)
      while (parseResult.data?.pubKey === undefined) {
        await sleep(5000);
        const res2 = await request(app)
          .get(`/elections/${election?.id}`)
          .set('Authorization', `Bearer ${tokens.accessToken}`);
        parseResult = selectableElectionObject.safeParse(res2.body);
      }

      // get voter tokens
      const tokensRes = await request(app)
        .get(voterTokensPath)
        .set('Authorization', `Bearer ${tokens.accessToken}`);
      expect(tokensRes.status).toBe(HttpStatusCode.ok);
      // voter group should have a pubKey
      const pubKey = await getVoterGroupPubKey(voterGroupId);
      if (pubKey === null) {
        throw new Error('Public key for voter group is null');
      }

      const res = await request(app)
        .put(unfreezePath)
        .set('Authorization', `Bearer ${tokens.accessToken}`);
      expect(res.status).toBe(HttpStatusCode.ok);
      expect(res.type).toBe('application/json');
      parseResult = selectableElectionObject.safeParse(res.body);
      expect(parseResult.success).toBe(true);
      if (parseResult.success === true) {
        expect(parseResult.data.id).toBe(election?.id);
        expect(parseResult.data.configFrozen).toBe(false);
        expect(parseResult.data.pubKey).toBe(undefined);
        expect(parseResult.data.primeP).toBe(undefined);
        expect(parseResult.data.primeQ).toBe(undefined);
        expect(parseResult.data.generator).toBe(undefined);
      }

      // voter group should not have a pubKey anymore
      const pubKeyAfterUnfreeze = await getVoterGroupPubKey(voterGroupId);
      expect(pubKeyAfterUnfreeze).toBeNull();
    },
  );
  it('403: should not unfreeze an election that is generating keys.', async () => {
    if (election === null) {
      throw new Error('Election is null');
    }
    // Deterministic state: key generation started just now and is still running.
    await setKeyGenState(election.id, new Date());

    const res = await request(app)
      .put(unfreezePath)
      .set('Authorization', `Bearer ${tokens.accessToken}`);
    expect(res.status).toBe(HttpStatusCode.forbidden);
    expect(res.type).toBe('application/json');
  });
  it('200: should unfreeze an election whose key generation timed out (#242).', async () => {
    if (election === null) {
      throw new Error('Election is null');
    }
    // Key generation started 16 minutes ago (KEY_GEN_TIMEOUT_MINUTES defaults to 15)
    // and never finished, e.g. because the backend died mid key generation.
    const sixteenMinutesInMs = 16 * 60 * 1000;
    await setKeyGenState(election.id, new Date(Date.now() - sixteenMinutesInMs));

    const res = await request(app)
      .put(unfreezePath)
      .set('Authorization', `Bearer ${tokens.accessToken}`);
    expect(res.status).toBe(HttpStatusCode.ok);
    expect(res.type).toBe('application/json');
    const parseResult = selectableElectionObject.safeParse(res.body);
    expect(parseResult.success).toBe(true);
    expect(parseResult.data?.configFrozen).toBe(false);

    // the key generation marker must be cleared as well
    const dbElection = await db
      .selectFrom('election')
      .select('keyGenStartedAt')
      .where('id', '=', election.id)
      .executeTakeFirstOrThrow();
    expect(dbElection.keyGenStartedAt).toBeNull();
  });
  it('200: should unfreeze an election without a key generation marker (#242).', async () => {
    if (election === null) {
      throw new Error('Election is null');
    }
    // Frozen without keys and without a marker: this is the state of elections that
    // got stuck before the marker column existed (no backfill in the migration).
    await setKeyGenState(election.id, null);

    const res = await request(app)
      .put(unfreezePath)
      .set('Authorization', `Bearer ${tokens.accessToken}`);
    expect(res.status).toBe(HttpStatusCode.ok);
    expect(res.type).toBe('application/json');
    const parseResult = selectableElectionObject.safeParse(res.body);
    expect(parseResult.success).toBe(true);
    expect(parseResult.data?.configFrozen).toBe(false);
  });
  it(
    'should discard a stale key generation result instead of writing keys (#242).',
    { timeout: 120000 },
    async () => {
      if (election === null) {
        throw new Error('Election is null');
      }
      const keyPair = await getKeyPair(20);

      // Freeze, then unfreeze while the (imaginary) key generation of run A is still working.
      const { keyGenStartedAt: tokenA } = await freezeElectionService(election.id);
      await unfreezeElectionService(election.id);

      // The late result of run A must be discarded, not written to the unfrozen election.
      const staleResult = await setElectionKeys(keyPair, election.id, tokenA);
      expect(staleResult).toBeNull();
      const dbElection = await db
        .selectFrom('election')
        .select(['pubKey', 'configFrozen'])
        .where('id', '=', election.id)
        .executeTakeFirstOrThrow();
      expect(dbElection.pubKey).toBeNull();
      expect(dbElection.configFrozen).toBe(false);

      // Re-freezing starts run B: the stale token A must still not write keys,
      // while the current token B must succeed.
      const { keyGenStartedAt: tokenB } = await freezeElectionService(election.id);
      expect(await setElectionKeys(keyPair, election.id, tokenA)).toBeNull();
      const currentResult = await setElectionKeys(keyPair, election.id, tokenB);
      expect(currentResult).not.toBeNull();
      expect(currentResult?.pubKey).toBeTypeOf('string');

      // cleanup: leave the election unfrozen for potential following tests
      await unfreezeElectionService(election.id);
    },
  );
});
