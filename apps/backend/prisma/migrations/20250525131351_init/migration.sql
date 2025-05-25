-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "created" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified" TIMESTAMPTZ(6) NOT NULL,
    "email" TEXT NOT NULL,
    "pwHash" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "lastLoginAt" TIMESTAMPTZ(6),
    "failedLoginAttempts" INTEGER DEFAULT 0,
    "emailVerificationTokenHash" TEXT,
    "emailVerificationTokenExpiresAt" TIMESTAMPTZ(6),
    "passwordResetTokenHash" TEXT,
    "passwordResetTokenExpiresAt" TIMESTAMPTZ(6),
    "passwordResetTokenUsedAt" TIMESTAMPTZ(6),
    "refreshTokenHash" TEXT,
    "refreshTokenExpiresAt" TIMESTAMPTZ(6),
    "refreshTokenRevokedAt" TIMESTAMPTZ(6),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "modified_after_created" CHECK ("modified" >= "created") -- manually added
);

-- CreateTable
CREATE TABLE "JwtBlacklist" (
    "jti" TEXT NOT NULL,
    "created" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified" TIMESTAMPTZ(6) NOT NULL,
    "expiresAt" TIMESTAMPTZ(6) NOT NULL,
    "blacklistedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "JwtBlacklist_pkey" PRIMARY KEY ("jti"),
    CONSTRAINT "modified_after_created" CHECK ("modified" >= "created") -- manually added
);

-- CreateTable
CREATE TABLE "Election" (
    "id" TEXT NOT NULL,
    "created" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified" TIMESTAMPTZ(6) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "votingStart" TIMESTAMPTZ(6) NOT NULL,
    "votingEnd" TIMESTAMPTZ(6) NOT NULL,
    "configFrozen" BOOLEAN NOT NULL DEFAULT false,
    "allowInvalidVotes" BOOLEAN NOT NULL DEFAULT false,
    "pubKeyVotes" BIGINT,
    "privKeyVotes" BIGINT,
    "primeP" BIGINT,
    "primeQ" BIGINT,
    "generator" BIGINT,
    "electionCreatorId" TEXT NOT NULL,

    CONSTRAINT "Election_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "votingEnd_after_votingStart" CHECK ("votingEnd" > "votingStart"), -- manually added
    CONSTRAINT "modified_after_created" CHECK ("modified" >= "created") -- manually added
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Election" ADD CONSTRAINT "Election_electionCreatorId_fkey" FOREIGN KEY ("electionCreatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
