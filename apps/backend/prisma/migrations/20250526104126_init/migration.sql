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
    "pubKey" BIGINT,
    "privKey" BIGINT,
    "primeP" BIGINT,
    "primeQ" BIGINT,
    "generator" BIGINT,
    "electionCreatorId" UUID NOT NULL,

    CONSTRAINT "Election_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "votingEnd_after_votingStart" CHECK ("votingEndAt" > "votingStartAt"), -- manually added
    CONSTRAINT "modified_after_created" CHECK ("modifiedAt" >= "createdAt") -- manually added
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "AccessTokenBlacklist_accessTokenId_key" ON "AccessTokenBlacklist"("accessTokenId");

-- AddForeignKey
ALTER TABLE "Election" ADD CONSTRAINT "Election_electionCreatorId_fkey" FOREIGN KEY ("electionCreatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
