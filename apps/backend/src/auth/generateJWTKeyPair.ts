import crypto from 'crypto';

/**
 * Generate RSA key pair for JWT signing and stores them in the environment
 */
export const generateJWTKeyPair = (): void => {
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

  // load keys into environment variables
  process.env.JWT_PRIVATE_KEY = Buffer.from(privateKey).toString('base64');
  process.env.JWT_PUBLIC_KEY = Buffer.from(publicKey).toString('base64');

  // make sure the keys are set
  if (process.env.JWT_PRIVATE_KEY === undefined || process.env.JWT_PUBLIC_KEY === undefined) {
    throw new Error('Failed to generate JWT key pair. Check your environment variables.');
  }
};
