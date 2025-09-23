import type { FilledBallotPaper, PlainBallotPaper } from '@repo/votura-validators';
import type { PublicKey } from '@votura/votura-crypto/index';
import { BallotPaperSectionEncryption } from './ballotPaperSection.js';

export class BallotPaperEncryption {
  private readonly publicKey: PublicKey;

  public constructor(publicKey: PublicKey) {
    this.publicKey = publicKey;
  }

  /**
   * Encrypts the vote of a complete ballot paper, section by section, and returns the encrypted vote as FilledBallotPaper.
   * Expects that the ballot paper has been validated using the zod plainBallotPaper schema.
   * @param plainBallotPaper The ballot paper to encrypt
   * @returns Encrypted vote of a complete ballot paper
   */
  public encryptBallotPaper(plainBallotPaper: PlainBallotPaper): FilledBallotPaper {
    const sectionEncryption = new BallotPaperSectionEncryption(this.publicKey);
    const encryptedSections: FilledBallotPaper['sections'] = {};

    for (const [sectionId, section] of Object.entries(plainBallotPaper.sections)) {
      const encryptedSection = sectionEncryption.encryptSection(section, sectionId);
      encryptedSections[sectionId] = { votes: encryptedSection.votes };
    }

    return {
      ballotPaperId: plainBallotPaper.ballotPaperId,
      sections: encryptedSections,
    };
  }
}
