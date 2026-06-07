import { db } from '@repo/db';
import type {
  FailedLoginAttempt as DBFailedLoginAttempt,
} from '@repo/db/types';
import type { Selectable } from 'kysely';
import type { Response429 } from "@repo/votura-validators";

function ipToBuffer(ip: string): Buffer {
  return Buffer.from(ip, 'utf-8');
}

export async function getFailedLoginAttempt(
  ipAddress: string,
): Promise<Selectable<DBFailedLoginAttempt> | null> {
  const failedLoginAttempt = await db
    .selectFrom('failedLoginAttempt')
    .selectAll()
    .where('ipAddress', '=', ipToBuffer(ipAddress))
    .executeTakeFirst();

  return failedLoginAttempt ?? null;
}

export async function getRetryIn(
    ipAddress: string,
): Promise<Response429['retryIn'] | null> {
  const failedLoginAttempt = await getFailedLoginAttempt(ipAddress);
  if (failedLoginAttempt?.blockedUntil && failedLoginAttempt.blockedUntil > new Date()) {
    const retryInMs = failedLoginAttempt.blockedUntil.getTime() - Date.now();
    const retryInSeconds = Math.ceil(retryInMs / 1000);

    const hours = Math.floor(retryInSeconds / 3600);
    const minutes = Math.floor((retryInSeconds % 3600) / 60);
    const seconds = retryInSeconds % 60;

    return { hours, minutes, seconds };
  }
  
  return null;
}

async function upsertFailedLoginAttemptEntry(
  ipAddressBuffer: Buffer<ArrayBufferLike>,
  failedAttempts: number,
  blockedUntil: Date | null,
  existingEntry: Selectable<DBFailedLoginAttempt> | null,
): Promise<void> {
  if (existingEntry) {
    await db
      .updateTable('failedLoginAttempt')
      .set({
        failedAttempts,
        blockedUntil,
      })
      .where('ipAddress', '=', ipAddressBuffer)
      .execute();
  } else {
    await db
      .insertInto('failedLoginAttempt')
      .values({
        ipAddress: ipAddressBuffer,
        failedAttempts,
        blockedUntil,
      })
      .execute();
  }
}

export async function recordFailedLoginAttempt(ipAddress: string): Promise<Response429['retryIn'] | null> {
  const bufferIp = ipToBuffer(ipAddress);
  const existing = await getFailedLoginAttempt(ipAddress);

  let newFailedAttempts = 1;
  if (existing) {
    newFailedAttempts = existing.failedAttempts + 1;
  }

  // Don't block first three tries (1s, 2s, 4s blocks are unnecessary)
  let blockedUntil = null;
  if (newFailedAttempts >= 3) {
    const blockedDuration = Math.pow(2, newFailedAttempts); // 8s, 16s, 32s, ...
    blockedUntil = new Date(Date.now() + blockedDuration * 1000);
  }

  await upsertFailedLoginAttemptEntry(bufferIp, newFailedAttempts, blockedUntil, existing);

  return getRetryIn(ipAddress);
}

export async function resetFailedLoginAttempt(ipAddress: string): Promise<void> {
  await db
    .deleteFrom('failedLoginAttempt')
    .where('ipAddress', '=', ipToBuffer(ipAddress))
    .execute();
}
