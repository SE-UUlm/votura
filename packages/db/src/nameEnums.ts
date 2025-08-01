// --- Regex patterns ---
export enum RegexPattern {
  email = '^[A-Za-z0-9._%+\\-]+@[A-Za-z0-9-]+\\.[A-Za-z]{2,4}$',
}

// --- Table names ---
export enum TableName {
  user = 'user',
  accessTokenBlacklist = 'accessTokenBlacklist',
  election = 'election',
  ballotPaper = 'ballotPaper',
  ballotPaperSection = 'ballotPaperSection',
  ballotPaperSectionCandidate = 'ballotPaperSectionCandidate',
  candidate = 'candidate',
  voterGroup = 'voterGroup',
  voter = 'voter',
  voterRegister = 'voterRegister',
}

// --- Column names ---
export enum DefaultColumnName {
  id = 'id',
  createdAt = 'createdAt',
  modifiedAt = 'modifiedAt',
}

export enum UserColumnName {
  email = 'email',
  passwordHash = 'passwordHash',
  verified = 'verified',
  emailVerificationTokenHash = 'emailVerificationTokenHash',
  emailVerificationTokenExpiresAt = 'emailVerificationTokenExpiresAt',
  passwordResetTokenHash = 'passwordResetTokenHash',
  passwordResetTokenExpiresAt = 'passwordResetTokenExpiresAt',
  refreshTokenHash = 'refreshTokenHash',
  refreshTokenExpiresAt = 'refreshTokenExpiresAt',
}

export enum AccessTokenBlacklistColumnName {
  accessTokenId = 'accessTokenId',
  expiresAt = 'expiresAt',
}

export enum ElectionColumnName {
  name = 'name',
  description = 'description',
  votingStartAt = 'votingStartAt',
  votingEndAt = 'votingEndAt',
  configFrozen = 'configFrozen',
  allowInvalidVotes = 'allowInvalidVotes',
  private = 'private',
  pubKey = 'pubKey',
  privKey = 'privKey',
  primeP = 'primeP',
  primeQ = 'primeQ',
  generator = 'generator',
  electionCreatorId = 'electionCreatorId',
}

export enum BallotPaperColumnName {
  name = 'name',
  description = 'description',
  maxVotes = 'maxVotes',
  maxVotesPerCandidate = 'maxVotesPerCandidate',
  electionId = 'electionId',
}

export enum BallotPaperSectionColumnName {
  name = 'name',
  description = 'description',
  maxVotes = 'maxVotes',
  maxVotesPerCandidate = 'maxVotesPerCandidate',
  ballotPaperId = 'ballotPaperId',
}

export enum BallotPaperSectionCandidateColumnName {
  ballotPaperSectionId = 'ballotPaperSectionId',
  candidateId = 'candidateId',
}

export enum CandidateColumnName {
  title = 'title',
  description = 'description',
  electionId = 'electionId',
}

export enum VoterGroupColumnName {
  name = 'name',
  description = 'description',
  pubKey = 'pubKey',
  voterGroupCreatorId = 'voterGroupCreatorId',
}

export enum VoterColumnName {
  voterGroupId = 'voterGroupId',
}

export enum VoterRegisterColumnName {
  voted = 'voted',
  ballotPaperId = 'ballotPaperId',
  voterId = 'voterId',
}

// Foreign key constraint names
export enum ElectionFKName {
  electionCreatorId = 'electionElectionCreatorIdFK',
}

export enum BallotPaperFKName {
  electionId = 'ballotPaperElectionIdFK',
}

export enum BallotPaperSectionFKName {
  ballotPaperId = 'ballotPaperSectionBallotPaperIdFK',
}

export enum BallotPaperSectionCandidateFKName {
  ballotPaperSectionId = 'ballotPaperSectionCandidateBallotPaperSectionIdFK',
  candidateId = 'ballotPaperSectionCandidateCandidateIdFK',
}

export enum CandidateFKName {
  electionId = 'candidateElectionIdFK',
}

export enum VoterGroupFKName {
  voterGroupCreatorId = 'voterGroupVoterGroupCreatorIdFK',
}

export enum VoterFKName {
  voterGroupId = 'voterVoterGroupIdFK',
}

export enum VoterRegisterFKName {
  ballotPaperId = 'voterRegisterBallotPaperIdFK',
  voterId = 'voterRegisterVoterIdFK',
}
