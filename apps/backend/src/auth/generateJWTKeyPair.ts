import crypto from 'crypto';

/**
 * Generates a RSA key pair for JWT signing.
 *
 * @returns An object containing the private and public keys as strings.
 */
export const generateRSAKeyPair = (): { privateKey: string; publicKey: string } => {
  const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 4096,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem',
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem',
    },
  });
  return { privateKey, publicKey };
};

/**
 * Sets a key pair for the users JWT to the environment variables USERS_JWT_PRIV_KEY and USERS_JWT_PUB_KEY.
 */
export const setUsersJWTKeyPair = (): void => {
  const { privateKey, publicKey } = generateRSAKeyPair();

  // load keys into environment variables
  process.env.USERS_JWT_PRIV_KEY = Buffer.from(privateKey).toString('base64');
  process.env.USERS_JWT_PUB_KEY = Buffer.from(publicKey).toString('base64');

  // make sure the keys are set
  if (process.env.USERS_JWT_PRIV_KEY === undefined || process.env.USERS_JWT_PUB_KEY === undefined) {
    throw new Error('Failed to generate JWT key pair. Check your environment variables.');
  }
};
