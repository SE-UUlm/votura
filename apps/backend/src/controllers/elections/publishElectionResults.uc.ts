import { BallotPaperSectionDecryption } from '@repo/votura-ballot-box';
import {
  filledBallotPaperDefaultVoteOption,
  type Election,
  type EncryptedFilledBallotPaper,
  type SelectableBallotPaper,
  type SelectableBallotPaperSection,
  type SelectableElectionResult,
} from '@repo/votura-validators';
import { PrivateKey, Tallying, type Ciphertext } from '@votura/votura-crypto/index';
import type { Request, Response } from 'express';
import { HttpStatusCode } from '../../httpStatusCode.js';
import {
  getBallotPaperEncryptionKeys,
  getBallotPapers,
} from '../../services/ballotPapers.service.js';
import { getBallotPaperSections } from '../../services/ballotPaperSections.service.js';
import { getCandidates } from '../../services/candidates.service.js';
import { setElectionResults } from '../../services/elections.service.js';
import { getEncryptedFilledBallotPapers } from '../../services/votes.service.js';

type BallotPaperResult = SelectableElectionResult['ballotPapers'][number];
type SectionResult = BallotPaperResult['ballotPaperSections'][number];
type OptionResult = Pick<SectionResult['candidates'][number], 'count' | 'ciphertext' | 'proof'>;
type SectionVotes = EncryptedFilledBallotPaper['sections'][string]['votes'];

// Aggregating zero votes results in an encryption of zero without randomness.
const emptyCiphertext: Ciphertext = [1n, 1n];

/**
 * Aggregates all votes of a section (without decrypting them) and decrypts the aggregated votes.
 * @returns The aggregated ciphertext and the decrypted count, in the order of the given options.
 */
const tallySectionVotes = (
  privateKey: PrivateKey,
  votes: SectionVotes,
  sectionId: string,
  options: string[],
): { ciphertext: Ciphertext; count: number }[] => {
  if (votes.length === 0) {
    return options.map(() => ({ ciphertext: emptyCiphertext, count: 0 }));
  }

  const aggregatedCiphertexts = new Tallying(privateKey).aggregateVotes(
    votes.map((vote) =>
      options.map((option): Ciphertext => {
        const voteData = vote[option];
        if (voteData === undefined) {
          // should never happen, as the votes were validated before they were persisted
          throw new Error(`Missing vote data for option ${option} in section ${sectionId}`);
        }
        return [BigInt(voteData.alpha), BigInt(voteData.beta)];
      }),
    ),
  );

  const decryption = new BallotPaperSectionDecryption(privateKey);
  decryption.calculateLookupTable(votes.length);
  const decryptedSection = decryption.decryptSection({ votes }, sectionId);
  if (typeof decryptedSection === 'string') {
    throw new Error(decryptedSection);
  }

  return options.map((option, index) => {
    let count = decryptedSection.candidateResults[option] ?? 0;
    if (option === filledBallotPaperDefaultVoteOption.noVote) {
      count = decryptedSection.noVoteCount;
    } else if (option === filledBallotPaperDefaultVoteOption.invalid) {
      count = decryptedSection.invalidCount;
    }
    return { ciphertext: aggregatedCiphertexts[index] ?? emptyCiphertext, count };
  });
};

const tallySection = (
  privateKey: PrivateKey,
  section: SelectableBallotPaperSection,
  filledBallotPapers: EncryptedFilledBallotPaper[],
  candidateTitles: Map<string, string>,
): { sectionResult: SectionResult; invalidVotes: number } => {
  const options = [
    ...section.candidateIds,
    filledBallotPaperDefaultVoteOption.noVote,
    filledBallotPaperDefaultVoteOption.invalid,
  ];
  const votes = filledBallotPapers.flatMap(
    (filledBallotPaper) => filledBallotPaper.sections[section.id]?.votes ?? [],
  );

  const optionResults = new Map<string, OptionResult>();
  tallySectionVotes(privateKey, votes, section.id, options).forEach(
    ({ ciphertext, count }, index) => {
      const proof = privateKey.createDecryptionProof(ciphertext);
      optionResults.set(options[index] ?? '', {
        count,
        ciphertext: { alpha: ciphertext[0].toString(), beta: ciphertext[1].toString() },
        proof: {
          commitment1: proof.commitment[0].toString(),
          commitment2: proof.commitment[1].toString(),
          challenge: proof.challenge.toString(),
          response: proof.response.toString(),
        },
      });
    },
  );
  const getOptionResult = (option: string): OptionResult => {
    const optionResult = optionResults.get(option);
    if (optionResult === undefined) {
      // should never happen, as every option was tallied above
      throw new Error(`Missing result for option ${option} in section ${section.id}`);
    }
    return optionResult;
  };

  const noVoteResult = getOptionResult(filledBallotPaperDefaultVoteOption.noVote);
  const invalidResult = getOptionResult(filledBallotPaperDefaultVoteOption.invalid);

  return {
    sectionResult: {
      id: section.id,
      name: section.name,
      maxVotes: section.maxVotes,
      noVoteCount: noVoteResult.count,
      noVoteCiphertext: noVoteResult.ciphertext,
      noVoteProof: noVoteResult.proof,
      invalidCiphertext: invalidResult.ciphertext,
      invalidProof: invalidResult.proof,
      candidates: section.candidateIds.map((candidateId) => ({
        id: candidateId,
        title: candidateTitles.get(candidateId) ?? '',
        ...getOptionResult(candidateId),
      })),
    },
    invalidVotes: invalidResult.count,
  };
};

const tallyBallotPaper = async (
  privateKey: PrivateKey,
  ballotPaper: SelectableBallotPaper,
  filledBallotPapers: EncryptedFilledBallotPaper[],
  candidateTitles: Map<string, string>,
): Promise<BallotPaperResult> => {
  const ballotPaperVotes = filledBallotPapers.filter(
    (filledBallotPaper) => filledBallotPaper.ballotPaperId === ballotPaper.id,
  );
  const sections = (await getBallotPaperSections(ballotPaper.id)).map((section) =>
    tallySection(privateKey, section, ballotPaperVotes, candidateTitles),
  );

  // An invalid ballot is invalid in every vote of every section (see validateAggregatedResults),
  // so the invalid votes of one section divided by its maxVotes are the invalid ballots.
  const firstSection = sections[0];
  const invalidCount =
    firstSection === undefined
      ? 0
      : firstSection.invalidVotes / firstSection.sectionResult.maxVotes;

  return {
    id: ballotPaper.id,
    name: ballotPaper.name,
    ballotsCast: ballotPaperVotes.length,
    invalidCount,
    ballotPaperSections: sections.map(({ sectionResult }) => sectionResult),
  };
};

export const publishElectionResults = async (
  req: Request<{ electionId: Election['id'] }>,
  res: Response<SelectableElectionResult>,
): Promise<void> => {
  const electionId = req.params.electionId;
  const ballotPapers = await getBallotPapers(electionId);
  const filledBallotPapers = await getEncryptedFilledBallotPapers(electionId);
  const candidateTitles = new Map(
    (await getCandidates(electionId)).map((candidate) => [candidate.id, candidate.title]),
  );

  // A frozen election always has at least one ballot paper (see checkElectionIsValid)
  const { pubKey, privKey, primeP, primeQ, generator } = await getBallotPaperEncryptionKeys(
    ballotPapers[0]?.id ?? '',
  );
  const privateKey = new PrivateKey(
    BigInt(primeP),
    BigInt(primeQ),
    BigInt(generator),
    BigInt(pubKey),
    BigInt(privKey),
  );

  const electionResult = await setElectionResults({
    electionId,
    publishedAt: new Date().toISOString(),
    pubKey,
    primeP,
    primeQ,
    generator,
    ballotPapers: await Promise.all(
      ballotPapers.map(async (ballotPaper) =>
        tallyBallotPaper(privateKey, ballotPaper, filledBallotPapers, candidateTitles),
      ),
    ),
  });
  res.status(HttpStatusCode.ok).json(electionResult);
};
