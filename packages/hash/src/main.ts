import {logger} from '@repo/logger';
import argon2 from 'argon2';

export const getPepper = () => {
    const envPepper = process.env.PEPPER;

    if (envPepper === undefined) {
        const error = new Error('PEPPER must be set in the environment');
        logger.error(error);
        throw error;
    }

    return envPepper;
};

export const hashPassword = (plaintext: string, pepper: string): Promise<string> => {
    return argon2.hash(plaintext + pepper);
};

export const verifyPassword = (hash: string, plaintext: string, pepper: string) => {
    return argon2.verify(hash, plaintext + pepper);
};
