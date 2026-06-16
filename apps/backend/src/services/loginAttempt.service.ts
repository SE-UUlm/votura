import { db } from '@repo/db';
import type { FailedLoginAttempt as DBFailedLoginAttempt } from '@repo/db/types';
import type { Response429 } from '@repo/votura-validators';
import type { Selectable } from 'kysely';

function ipToBuffer(ip: string): Buffer {
  return Buffer.from(ip, 'utf-8');
}

/**
 * Get the list of failed login attempts for an IP address
 * @param ipAddress
 */
async function getFailedLoginAttemptsForIP(
  ipAddress: string,
): Promise<Selectable<DBFailedLoginAttempt>[]> {
  const failedLoginAttempts = await db
    .selectFrom('failedLoginAttempt')
    .selectAll()
    .where('ipAddress', '=', ipToBuffer(ipAddress))
    .execute();

  return failedLoginAttempts ?? [];
}

/**
 * Get the list of failed login attempts for a user ID
 * @param userId
 */
async function getFailedLoginAttemptsForUser(
  userId: string,
): Promise<Selectable<DBFailedLoginAttempt>[]> {
  const failedLoginAttempts = await db
    .selectFrom('failedLoginAttempt')
    .selectAll()
    .where('userId', '=', userId)
    .execute();

  return failedLoginAttempts ?? [];
}

/**
 * Given a list of failed login attempts, calculate until when this vector (IP or user ID) should be blocked
 * @param failedLoginAttempts
 */
function calculateBlockedUntilForSingleVector(
  failedLoginAttempts: Selectable<DBFailedLoginAttempt>[],
): Date | null {
  if (failedLoginAttempts.length >= 3) {
    const latestAttempt = failedLoginAttempts[failedLoginAttempts.length - 1];
    if (!latestAttempt) {
      return null;
    }

    const blockedDuration = Math.pow(2, failedLoginAttempts.length); // 8s, 16s, 32s, ...
    return new Date(latestAttempt.createdAt.getTime() + blockedDuration * 1000);
  }

  return null;
}

/**
 * Calculate until when the client is blocked from logging in
 * @param ipAddress
 * @param userId
 */
async function calculateBlockedUntil(
  ipAddress: string,
  userId: string | null,
): Promise<Date | null> {
  const ipFailedLoginAttempts = await getFailedLoginAttemptsForIP(ipAddress);
  const ipBlockedUntil = calculateBlockedUntilForSingleVector(ipFailedLoginAttempts);

  const userFailedLoginAttempts =
    userId !== null ? await getFailedLoginAttemptsForUser(userId) : [];
  const userBlockedUntil = calculateBlockedUntilForSingleVector(userFailedLoginAttempts);

  if (ipBlockedUntil !== null && userBlockedUntil !== null) {
    return ipBlockedUntil > userBlockedUntil ? ipBlockedUntil : userBlockedUntil;
  } else if (ipBlockedUntil !== null) {
    return ipBlockedUntil;
  } else if (userBlockedUntil !== null) {
    return userBlockedUntil;
  }

  return null;
}

/**
 * Get the API response object to inform the client when they can try to log in again
 * @param ipAddress
 * @param userId
 */
export async function getRetryIn(
  ipAddress: string,
  userId: string | null,
): Promise<Response429['retryIn'] | null> {
  const blockedUntil = await calculateBlockedUntil(ipAddress, userId);
  if (blockedUntil !== null && blockedUntil > new Date()) {
    const retryInMs = blockedUntil.getTime() - Date.now();
    const retryInSeconds = Math.ceil(retryInMs / 1000);

    const hours = Math.floor(retryInSeconds / 3600);
    const minutes = Math.floor((retryInSeconds % 3600) / 60);
    const seconds = retryInSeconds % 60;

    return { hours, minutes, seconds };
  }

  return null;
}

/**
 * Save a new login attempt entry to the database
 * @param ipAddress
 * @param userId
 */
export async function recordFailedLoginAttempt(
  ipAddress: string,
  userId: string | null,
): Promise<void> {
  await db
    .insertInto('failedLoginAttempt')
    .values({
      ipAddress: ipToBuffer(ipAddress),
      userId,
    })
    .execute();
}

/**
 * Delete all failed login attempt entries from the database with this IP address or user ID (e.g. after a successful login or a password reset)
 * @param ipAddress
 * @param userId
 */
export async function resetFailedLoginAttempts(ipAddress: string, userId: string): Promise<void> {
  await db
    .deleteFrom('failedLoginAttempt')
    .where((eb) => eb.or([eb('ipAddress', '=', ipToBuffer(ipAddress)), eb('userId', '=', userId)]))
    .execute();
}
