import argon2 from "argon2";

const PEPPER_ENV_VAR: string | undefined = process.env.PEPPER;

/**
 * Hashes a plaintext password using Argon2id (auto‐generated salt) 
 * plus a server‐wide “pepper” from process.env.PEPPER.
 *
 * @param plainPassword – the user’s raw password
 * @returns a Promise that resolves to the Argon2id hash string
 * @throws if PEPPER is not defined
 */
export async function hashPassword(plainPassword: string): Promise<string> {
  if (!PEPPER_ENV_VAR) {
    throw new Error("PEPPER is not set in environment");
  }

  const passwordWithPepper: string = `${plainPassword}${PEPPER_ENV_VAR}`;
  const hash: string = await argon2.hash(passwordWithPepper, {
    type: argon2.argon2id,
  });

  return hash;
}

/**
 * Compares an attempted password (plain) against the stored Argon2id hash.
 *
 * @param storedHash – the full Argon2id hash (including its salt, params)
 * @param attemptedPassword – the raw password user is trying
 * @returns a Promise<boolean> → true if match, else false
 * @throws if PEPPER is not defined
 */
export async function verifyPassword(
  storedHash: string,
  attemptedPassword: string
): Promise<boolean> {
  if (!PEPPER_ENV_VAR) {
    throw new Error("PEPPER is not set in environment");
  }

  const passwordWithPepper: string = `${attemptedPassword}${PEPPER_ENV_VAR}`;
  const isMatch: boolean = await argon2.verify(storedHash, passwordWithPepper);
  
  return isMatch;
}