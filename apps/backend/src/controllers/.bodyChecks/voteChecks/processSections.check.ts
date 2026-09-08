import type { BallotPaperSectionDecryption, DecryptedSection } from '@repo/votura-ballot-box';
import type { EncryptedFilledBallotPaper } from '@repo/votura-validators';
import { HttpStatusCode } from '../../../httpStatusCode.js';
import { areInvalidVotesAllowedInBP } from '../../../services/ballotPapers.service.js';
import { getBPSMaxVotesForBP } from '../../../services/ballotPaperSections.service.js';
import {
  type VoteValidationError,
  VoteValidationErrorMessage,
} from './encryptedFilledBallotPaper.check.js';
import { validateSectionCandidateVoteLimits } from './sectionCandidateVoteLimits.check.js';
import { validateSectionInvalidVotes } from './sectionInvalidVotes.check.js';

/**
 * Decrypts the filled ballot paper using the provided BallotDecryption instance.
 * In this step, it is also checked, that the proofs of the ciphertexts are valid.
 * Validates each section for invalid votes consistency (either all votes are invalid or none are)
 * and candidate vote limits (no candidate exceeds maxVotesPerCandidate).
 * @param encryptedFilledBallotPaper The encrypted filled ballot paper data.
 * @param decryption The ballot decryption instance.
 * @returns The processed and validated sections, each containing the decrypted vote results, or an error.
 */
export const processAndValidateSections = async (
  encryptedFilledBallotPaper: EncryptedFilledBallotPaper,
  decryption: BallotPaperSectionDecryption,
): Promise<{ sections: DecryptedSection[]; error?: VoteValidationError }> => {
  const maxVotesPerSection = await getBPSMaxVotesForBP(encryptedFilledBallotPaper.ballotPaperId);
  const maxVotesValues = Object.values(maxVotesPerSection).map((v) => v.maxVotes);

  decryption.calculateLookupTable(Math.max(...maxVotesValues));

  const votesInSections: DecryptedSection[] = [];

  for (const [sectionId, section] of Object.entries(encryptedFilledBallotPaper.sections)) {
    const votesInSection = decryption.decryptSection(section, sectionId);
    if (typeof votesInSection === 'string') {
      // Decryption or verification failed
      return {
        sections: [],
        error: {
          status: HttpStatusCode.badRequest,
          message: VoteValidationErrorMessage.invalidVote,
        },
      };
    }

    const maxVotesPerCandidate = maxVotesPerSection[sectionId]?.maxVotesPerCandidate;
    if (maxVotesPerCandidate === undefined) {
      // should never happen but typescript doesn't know that
      throw new Error(`maxVotesPerCandidate is undefined for section ${sectionId}`);
    }

    // Validate invalid votes consistency (either all votes are invalid or none are)
    // and that invalid votes are only present if allowed
    const invalidVotesAllowed = await areInvalidVotesAllowedInBP(
      encryptedFilledBallotPaper.ballotPaperId,
    );
    if (!validateSectionInvalidVotes(votesInSection, section.votes.length, invalidVotesAllowed)) {
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
