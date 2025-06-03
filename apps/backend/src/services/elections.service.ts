import type { InsertableElection, SelectableElection, User } from '@repo/votura-validators';
import { prisma } from '../client.js';

export const createElection = async (
  election: InsertableElection,
  userId: User['id'],
): Promise<SelectableElection> => {
  const dbUser = await prisma.election.create({
    data: {
      ...election,
      description: election.description ?? null,
      electionCreatorRelation: {
        connect: {
          id: userId,
        },
      },
    },
    select: {
      id: true,
      createdAt: true,
      modifiedAt: true,
      name: true,
      description: true,
      votingStartAt: true,
      votingEndAt: true,
      allowInvalidVotes: true,
      configFrozen: true,
      pubKey: true,
      primeP: true,
      primeQ: true,
      generator: true,
    },
  });

  return {
    id: dbUser.id,
    name: dbUser.name,
    ...(dbUser.description ? { description: dbUser.description } : undefined),
    createdAt: dbUser.createdAt.toISOString(),
    modifiedAt: dbUser.modifiedAt.toISOString(),
    votingStartAt: dbUser.votingStartAt.toISOString(),
    votingEndAt: dbUser.votingEndAt.toISOString(),
    configFrozen: dbUser.configFrozen,
    allowInvalidVotes: dbUser.allowInvalidVotes,
    ...(dbUser.pubKey ? { pubKey: dbUser.pubKey } : undefined),
    ...(dbUser.primeP ? { primeP: dbUser.primeP } : undefined),
    ...(dbUser.primeQ ? { primeQ: dbUser.primeQ } : undefined),
    ...(dbUser.generator ? { generator: dbUser.generator } : undefined),
  };
};
