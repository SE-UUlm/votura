-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifiedAt" TIMESTAMPTZ(6) NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "emailVerificationTokenHash" TEXT,
    "emailVerificationTokenExpiresAt" TIMESTAMPTZ(6),
    "passwordResetTokenHash" TEXT,
    "passwordResetTokenExpiresAt" TIMESTAMPTZ(6),
    "refreshTokenHash" TEXT,
    "refreshTokenExpiresAt" TIMESTAMPTZ(6),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "modified_after_created" CHECK ("modifiedAt" >= "createdAt") -- manually added
);

-- CreateTable
CREATE TABLE "AccessTokenBlacklist" (
    "id" UUID NOT NULL,
    "accessTokenId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifiedAt" TIMESTAMPTZ(6) NOT NULL,
    "expiresAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "AccessTokenBlacklist_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "modified_after_created" CHECK ("modifiedAt" >= "createdAt") -- manually added
);

-- CreateTable
CREATE TABLE "Election" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifiedAt" TIMESTAMPTZ(6) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "votingStartAt" TIMESTAMPTZ(6) NOT NULL,
    "votingEndAt" TIMESTAMPTZ(6) NOT NULL,
    "configFrozen" BOOLEAN NOT NULL DEFAULT false,
    "allowInvalidVotes" BOOLEAN NOT NULL DEFAULT false,
    "pubKey" NUMERIC,
    "privKey" NUMERIC,
    "primeP" NUMERIC,
    "primeQ" NUMERIC,
    "generator" NUMERIC,
    "electionCreatorId" UUID NOT NULL,

    CONSTRAINT "Election_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "votingEnd_after_votingStart" CHECK ("votingEndAt" > "votingStartAt"), -- manually added
    CONSTRAINT "modified_after_created" CHECK ("modifiedAt" >= "createdAt") -- manually added
);

-- CreateTable
CREATE TABLE "BallotPaper" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifiedAt" TIMESTAMPTZ(6) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "maxVotes" INTEGER NOT NULL,
    "maxVotesPerCandidate" INTEGER NOT NULL,
    "electionId" UUID NOT NULL,

    CONSTRAINT "BallotPaper_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "modified_after_created" CHECK ("modifiedAt" >= "createdAt"), -- manually added
    CONSTRAINT "maxVotes_and_candidate" CHECK ("maxVotes" >= "maxVotesPerCandidate") -- manually added
);

-- CreateTable
CREATE TABLE "BallotPaperSection" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifiedAt" TIMESTAMPTZ(6) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "maxVotes" INTEGER NOT NULL,
    "maxVotesPerCandidate" INTEGER NOT NULL,
    "ballotPaperId" UUID NOT NULL,

    CONSTRAINT "BallotPaperSection_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "modified_after_created" CHECK ("modifiedAt" >= "createdAt"), -- manually added
    CONSTRAINT "maxVotes_and_candidate" CHECK ("maxVotes" >= "maxVotesPerCandidate") -- manually added
);

-- CreateTable
CREATE TABLE "BallotPaperSectionCandidate" (
    "id" UUID NOT NULL,
    "ballotPaperSectionId" UUID NOT NULL,
    "candidateId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifiedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "BallotPaperSectionCandidate_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "modified_after_created" CHECK ("modifiedAt" >= "createdAt") -- manually added
);

-- CreateTable
CREATE TABLE "Candidate" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifiedAt" TIMESTAMPTZ(6) NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "electionId" UUID NOT NULL,

    CONSTRAINT "Candidate_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "modified_after_created" CHECK ("modifiedAt" >= "createdAt") -- manually added
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "AccessTokenBlacklist_accessTokenId_key" ON "AccessTokenBlacklist"("accessTokenId");

-- AddForeignKey
ALTER TABLE "Election" ADD CONSTRAINT "Election_electionCreatorId_fkey" FOREIGN KEY ("electionCreatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BallotPaper" ADD CONSTRAINT "BallotPaper_electionId_fkey" FOREIGN KEY ("electionId") REFERENCES "Election"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BallotPaperSection" ADD CONSTRAINT "BallotPaperSection_ballotPaperId_fkey" FOREIGN KEY ("ballotPaperId") REFERENCES "BallotPaper"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BallotPaperSectionCandidate" ADD CONSTRAINT "BallotPaperSectionCandidate_ballotPaperSectionId_fkey" FOREIGN KEY ("ballotPaperSectionId") REFERENCES "BallotPaperSection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BallotPaperSectionCandidate" ADD CONSTRAINT "BallotPaperSectionCandidate_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Candidate" ADD CONSTRAINT "Candidate_electionId_fkey" FOREIGN KEY ("electionId") REFERENCES "Election"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
