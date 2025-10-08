import {
  filledBallotPaperDefaultVoteOption,
  filledBallotPaperObject,
  zodErrorToResponse400,
  type FilledBallotPaper,
} from '@repo/votura-validators';
import { PrivateKey } from '@votura/votura-crypto/index';
import { HttpStatusCode } from '../../httpStatusCode.js';
import {
  checkBallotPaperIsVotable,
  getBallotPaperEncryptionKeys,
  getBallotPaperMaxVotes,
  getBallotPaperSectionCount,
} from '../../services/ballotPapers.service.js';
import {
  getBPSMaxVotesForBP,
  getCandidateIdsForBallotPaperSection,
} from '../../services/ballotPaperSections.service.js';
import { checkVoterMayVoteOnBallotPaper } from '../../services/voters.service.js';
import { setsEqual } from '../../utils.js';
import { BallotDecryption, type DecryptedSectionResult } from '../voteTallying/ballotDecryption.js';
import {
  isBodyCheckValidationError,
  type BodyCheckValidationError,
} from './bodyCheckValidationError.js';

export enum VoteValidationErrorMessage {
  notAllowedToVote = 'The voter is not allowed to vote on the specified ballot paper, either because it does not exist, the voter is not assigned to it, or they already voted.',
  electionNotVotable = "The election the ballot paper belongs to is not votable e.g. because it hasn't started yet or isn't frozen.",
  invalidVote = 'The contents of the filled ballot paper are invalid and can not be accepted.',
}

export interface VoteValidationError extends BodyCheckValidationError {
  message: VoteValidationErrorMessage | string;
}

/**
 * Validate the request body against the filled ballot paper schema.
 * @param body The request body to validate.
 * @returns The validated filled ballot paper or a validation error.
 */
const validateRequestBody = async (
  body: unknown,
): Promise<FilledBallotPaper | VoteValidationError> => {
  const { data, error, success } = await filledBallotPaperObject.safeParseAsync(body);

  if (!success) {
    return {
      status: HttpStatusCode.badRequest,
      message: zodErrorToResponse400(error).message,
    };
  }

  return data;
};

/**
 * Validate if the ballot paper exists, the voter is assigned to it, and they haven't voted yet.
 * @param voterId The ID of the voter.
 * @param ballotPaperId The ID of the ballot paper.
 * @returns A validation error if the voter is not allowed to vote, otherwise null.
 */
const validateBallotPaperStatus = async (
  voterId: string,
  ballotPaperId: string,
): Promise<VoteValidationError | null> => {
  const mayVote = await checkVoterMayVoteOnBallotPaper(voterId, ballotPaperId);
  if (!mayVote) {
    return {
      status: HttpStatusCode.forbidden,
      message: VoteValidationErrorMessage.notAllowedToVote,
    };
  }
  return null;
};

/**
 * Check if the election the ballot paper belongs to is votable (i.e., started, not ended, and frozen).
 * @param ballotPaperId The ID of the ballot paper.
 * @returns A validation error if the election is not votable, otherwise null.
 */
const validateElectionIsVotable = async (
  ballotPaperId: string,
): Promise<VoteValidationError | null> => {
  const isVotable = await checkBallotPaperIsVotable(ballotPaperId);
  if (!isVotable) {
    return {
      status: HttpStatusCode.forbidden,
      message: VoteValidationErrorMessage.electionNotVotable,
    };
  }
  return null;
};

/**
 * Check if the count of sections in the filled ballot paper matches the expected count.
 * @param data The filled ballot paper to validate.
 * @returns A validation error if the structure is invalid, otherwise null.
 */
const validateBallotPaperStructure = async (
  data: FilledBallotPaper,
): Promise<VoteValidationError | null> => {
  const expectedSectionCount = await getBallotPaperSectionCount(data.ballotPaperId);
  const actualSectionCount = Object.keys(data.sections).length;

  if (actualSectionCount !== expectedSectionCount) {
    return {
      status: HttpStatusCode.badRequest,
      message: VoteValidationErrorMessage.invalidVote,
    };
  }

  return null;
};

/**
 * Extracts candidate IDs from votes, excluding special options 'noVote' and 'invalid'.
 * @param votes Array of vote objects from which to extract candidate IDs.
 * @returns A set of unique candidate IDs.
 */
const extractCandidateIds = (
  votes: FilledBallotPaper['sections'][string]['votes'],
): Set<string> => {
  const excludedKeys: string[] = [
    filledBallotPaperDefaultVoteOption.noVote,
    filledBallotPaperDefaultVoteOption.invalid,
  ];

  return new Set(
    votes.flatMap((vote) => Object.keys(vote).filter((key) => !excludedKeys.includes(key))),
  );
};

/**
 * Check if each section's votes are equal to the maximum allowed votes in that section (noVote and invalid votes count towards this),
 * and if the candidate IDs in the votes match the expected candidate IDs for that section.
 * @param filledBallotPaper The filled ballot paper to validate.
 * @returns A validation error if any section's votes are invalid, otherwise null.
 */
const validateSectionVotes = async (
  filledBallotPaper: FilledBallotPaper,
): Promise<VoteValidationError | null> => {
  const maxVotesPerSection = await getBPSMaxVotesForBP(filledBallotPaper.ballotPaperId);

  for (const [sectionId, section] of Object.entries(filledBallotPaper.sections)) {
    const votesInSection = section.votes;
    const expectedMaxVotes = maxVotesPerSection[sectionId]?.maxVotes;

    // Validate vote count
    if (votesInSection?.length !== expectedMaxVotes) {
      return {
        status: HttpStatusCode.badRequest,
        message: VoteValidationErrorMessage.invalidVote,
      };
    }

    // Validate candidate IDs
    const candidateIdsInSection = extractCandidateIds(votesInSection);
    const expectedCandidateIds = await getCandidateIdsForBallotPaperSection(sectionId);

    if (!setsEqual(candidateIdsInSection, new Set(expectedCandidateIds))) {
      return {
        status: HttpStatusCode.badRequest,
        message: VoteValidationErrorMessage.invalidVote,
      };
    }
  }

  return null;
};

/**
 * Create and configure a ballot decryption instance.
 * @param ballotPaperId The ID of the ballot paper to decrypt.
 * @returns A promise that resolves to a BallotDecryption instance.
 */
const createBallotDecryption = async (ballotPaperId: string): Promise<BallotDecryption> => {
  const { pubKey, privKey, primeP, primeQ, generator } =
    await getBallotPaperEncryptionKeys(ballotPaperId);

  const privKeyObj = new PrivateKey(
    BigInt(primeP),
    BigInt(primeQ),
    BigInt(generator),
    BigInt(pubKey),
    BigInt(privKey),
  );

  return new BallotDecryption(privKeyObj);
};

/**
 * Check if the number of invalid votes in a section is either zero or equals the total number of votes in that section. If not, the section is invalid.
 * @param votesInSection The decrypted votes in the section.
 * @param sectionVoteCount The total number of votes in the section.
 * @returns True if the invalid vote count is valid, otherwise false.
 */
const validateSectionInvalidVotes = (
  votesInSection: DecryptedSectionResult,
  sectionVoteCount: number,
): boolean => {
  const { invalidCount } = votesInSection;
  return invalidCount === 0 || invalidCount === sectionVoteCount;
};

/**
 * Check if any candidate in the section has received more votes than the maximum allowed per candidate. If so, the section is invalid.
 * @param votesInSection The decrypted votes in the section.
 * @param maxVotesPerCandidate The maximum allowed votes per candidate in the section.
 * @returns True if all candidates are within the vote limits, otherwise false.
 */
const validateSectionCandidateVoteLimits = (
  votesInSection: DecryptedSectionResult,
  maxVotesPerCandidate: number,
): boolean => {
  return Object.values(votesInSection.candidateResults).every(
    (votes) => votes <= maxVotesPerCandidate,
  );
};

/**
 * Decrypts the filled ballot paper using the provided BallotDecryption instance.
 * Validates each section for invalid votes consistency (either all votes are invalid or none are)
 * and candidate vote limits (no candidate exceeds maxVotesPerCandidate).
 * @param filledBallotPaper The filled ballot paper data.
 * @param decryption The ballot decryption instance.
 * @returns The processed and validated sections, each containing the decrypted vote results, or an error.
 */
const processAndValidateSections = async (
  filledBallotPaper: FilledBallotPaper,
  decryption: BallotDecryption,
): Promise<{ sections: DecryptedSectionResult[]; error?: VoteValidationError }> => {
  const maxVotesPerSection = await getBPSMaxVotesForBP(filledBallotPaper.ballotPaperId);
  const maxVotesValues = Object.values(maxVotesPerSection).map((v) => v.maxVotes);

  decryption.calculateLookupTable(Math.max(...maxVotesValues));

  const votesInSections: DecryptedSectionResult[] = [];

  for (const [sectionId, section] of Object.entries(filledBallotPaper.sections)) {
    const votesInSection = decryption.decryptSection(section, sectionId);
    const maxVotesPerCandidate = maxVotesPerSection[sectionId]?.maxVotesPerCandidate;

    if (maxVotesPerCandidate === undefined) {
      // should never happen but typescript doesn't know that
      throw new Error(`maxVotesPerCandidate is undefined for section ${sectionId}`);
    }

    // Validate invalid votes consistency (either all votes are invalid or none are)
    if (!validateSectionInvalidVotes(votesInSection, section.votes.length)) {
      return {
        sections: [],
        error: {
          status: HttpStatusCode.badRequest,
          message: VoteValidationErrorMessage.invalidVote,
        },
      };
    }

    // Validate candidate vote limits (no candidate exceeds maxVotesPerCandidate)
    if (!validateSectionCandidateVoteLimits(votesInSection, maxVotesPerCandidate)) {
      return {
        sections: [],
        error: {
          status: HttpStatusCode.badRequest,
          message: VoteValidationErrorMessage.invalidVote,
        },
      };
    }

    votesInSections.push(votesInSection);
  }

  return { sections: votesInSections };
};

/**
 * Aggregates votes across the given decrypted ballot paper sections.
 * Disregards 'noVote' counts and sums up votes per candidate and total invalid votes.
 * @param decryptedVotesInSections Array of decrypted votes per section.
 * @returns The aggregated votes per candidate and invalid count.
 */
const aggregateVotes = (
  decryptedVotesInSections: DecryptedSectionResult[],
): { totalVotesPerCandidate: Record<string, number>; totalInvalidCount: number } => {
  const totalVotesPerCandidate: Record<string, number> = {};
  let totalInvalidCount = 0;

  for (const votesInSection of decryptedVotesInSections) {
    // Aggregate candidate votes
    for (const [candidateId, votes] of Object.entries(votesInSection.candidateResults)) {
      totalVotesPerCandidate[candidateId] = (totalVotesPerCandidate[candidateId] ?? 0) + votes;
    }

    totalInvalidCount += votesInSection.invalidCount;
  }

  return { totalVotesPerCandidate, totalInvalidCount };
};

/**
 * Checks the aggregated results for the entire ballot paper.
 * Validates global invalid votes consistency (either all votes are invalid or none),
 * global candidate vote limits (no candidate exceeds maxVotesPerCandidate of the ballot paper)
 * and total votes against maxVotes of the ballot paper.
 * @param filledBallotPaper The filled ballot paper data.
 * @param totalVotesPerCandidate A record of total votes per candidate across all sections.
 * @param totalInvalidCount The total invalid vote count.
 * @returns A validation error if any checks fail, or null if all checks pass.
 */
const validateAggregatedResults = async (
  filledBallotPaper: FilledBallotPaper,
  totalVotesPerCandidate: Record<string, number>,
  totalInvalidCount: number,
): Promise<VoteValidationError | null> => {
  const totalVoteCount = Object.values(filledBallotPaper.sections).flatMap((s) => s.votes).length;

  // Validate ballot paper invalid votes consistency (either all votes are invalid or none are)
  if (totalInvalidCount !== 0 && totalInvalidCount !== totalVoteCount) {
    return {
      status: HttpStatusCode.badRequest,
      message: VoteValidationErrorMessage.invalidVote,
    };
  }

  const { maxVotes: maxVotesBP, maxVotesPerCandidate: maxVotesPerCandidateBP } =
    await getBallotPaperMaxVotes(filledBallotPaper.ballotPaperId);
  let totalVotesForAllCandidates = 0;

  // Validate ballot paper candidate vote limits (no candidate exceeds maxVotesPerCandidate of the ballot paper)
  for (const votes of Object.values(totalVotesPerCandidate)) {
    if (votes > maxVotesPerCandidateBP) {
      return {
        status: HttpStatusCode.badRequest,
        message: VoteValidationErrorMessage.invalidVote,
      };
    }

    totalVotesForAllCandidates += votes;
  }

  // Validate that the sum of votes for candidates does not exceed maxVotes of the ballot paper
  if (totalVotesForAllCandidates > maxVotesBP) {
    return {
      status: HttpStatusCode.badRequest,
      message: VoteValidationErrorMessage.invalidVote,
    };
  }

  return null;
};

/**
 * Checks and validates a filled ballot paper.
 * If any check fails, an appropriate error is returned.
 * If all checks pass, the validated filled ballot paper is returned and can be safely stored.
 * @param body The request body containing the filled ballot paper.
 * @param voterId The ID of the voter submitting the ballot paper.
 * @returns The validated filled ballot paper or a validation error.
 */
export const validateFilledBallotPaper = async (
  body: unknown,
  voterId: string,
): Promise<FilledBallotPaper | VoteValidationError> => {
  // Step 1: Validate request body schema
  const bodyValidationResult = await validateRequestBody(body);
  if (isBodyCheckValidationError(bodyValidationResult)) {
    return bodyValidationResult;
  }
  const data = bodyValidationResult;

  // Step 2: Validate if the ballot paper exists, the voter is assigned to it, and they haven't voted yet
  const permissionError = await validateBallotPaperStatus(voterId, data.ballotPaperId);
  if (permissionError !== null) {
    return permissionError;
  }

  // Step 3: Validate if the election is votable (i.e., started, not ended, and frozen)
  const electionError = await validateElectionIsVotable(data.ballotPaperId);
  if (electionError !== null) {
    return electionError;
  }

  // Step 4: Validate ballot paper structure (i.e., correct number of sections)
  const structureError = await validateBallotPaperStructure(data);
  if (structureError !== null) {
    return structureError;
  }

  // Step 5: Validate section votes and candidate IDs (vote count equals maxVotes, candidate IDs are the ones linked to the section)
  const sectionError = await validateSectionVotes(data);
  if (sectionError !== null) {
    return sectionError;
  }

  // Step 6: Process and validate sections with decryption (either all votes are invalid or none, no candidate exceeds maxVotesPerCandidate)
  // maxVotes of the Section does not need to be checked here, as the section only contains as many votes (including 'noVote') as maxVotes, as assured by step 5
  const decryption: BallotDecryption = await createBallotDecryption(data.ballotPaperId);
  const { sections: votesInSections, error: processingError } = await processAndValidateSections(
    data,
    decryption,
  );
  if (processingError !== undefined) {
    return processingError;
  }

  // Step 7: Aggregate votes and validate final results for the entire ballot paper
  // (either all votes are invalid or none,
  // no candidate exceeds maxVotesPerCandidate,
  // the sum of votes for candidates over all sections is not greater than maxVotes of the ballot paper)
  const { totalVotesPerCandidate, totalInvalidCount } = aggregateVotes(votesInSections);
  const aggregationError = await validateAggregatedResults(
    data,
    totalVotesPerCandidate,
    totalInvalidCount,
  );
  if (aggregationError !== null) {
    return aggregationError;
  }

  return data;
};
