import type { EncryptedFilledBallotPaper, PlainFilledBallotPaper } from '@repo/votura-validators';
import type { PublicKey } from '@votura/votura-crypto/index';
import { BallotPaperSectionEncryption, type AuditableVote } from './ballotPaperSection.js';

export class BallotPaperEncryption {
  private readonly publicKey: PublicKey;

  public constructor(publicKey: PublicKey) {
    this.publicKey = publicKey;
  }

  /**
   * Encrypts the vote of a complete ballot paper, section by section, and returns the encrypted vote as EncryptedFilledBallotPaper.
   * Expects that the ballot paper has been validated using the zod plainBallotPaper schema.
   * @param plainFilledBallotPaper The ballot paper to encrypt
   * @returns Encrypted vote of a complete ballot paper
   */
  public encryptBallotPaper(
    plainFilledBallotPaper: PlainFilledBallotPaper,
  ): [EncryptedFilledBallotPaper, AuditableVote[]] {
    const sectionEncryption = new BallotPaperSectionEncryption(this.publicKey);
    const encryptedSections: EncryptedFilledBallotPaper['sections'] = {};
    const allAuditableVotes: AuditableVote[] = [];

    for (const [sectionId, section] of Object.entries(plainFilledBallotPaper.sections)) {
      const [encryptedSection, auditableVotes] = sectionEncryption.encryptSection(
        section,
        sectionId,
      );
      encryptedSections[sectionId] = { votes: encryptedSection.votes };
      allAuditableVotes.push(...auditableVotes);
    }

    return [
      {
        ballotPaperId: plainFilledBallotPaper.ballotPaperId,
        sections: encryptedSections,
      },
      allAuditableVotes,
    ];
  }
}
