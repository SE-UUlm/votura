import { logger } from '@repo/logger';
import argon2 from 'argon2';

export const getPepper = (): string => {
  const envPepper = process.env.PEPPER;

  if (envPepper === undefined) {
    const error = new Error('PEPPER must be set in the environment');
    logger.error(error);
    throw error;
  }

  return envPepper;
};

export const hashPassword = async (plaintext: string, pepper: string): Promise<string> => {
  return argon2.hash(plaintext + pepper);
};

export const verifyPassword = async (
  hash: string,
  plaintext: string,
  pepper: string,
): Promise<boolean> => {
  return argon2.verify(hash, plaintext + pepper);
};
