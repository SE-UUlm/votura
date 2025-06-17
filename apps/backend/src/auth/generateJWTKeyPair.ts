import crypto from 'crypto';

// Generate RSA key pair for JWT signing (run this once and save to .env)
export const generateKeyPair = () => {
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

  console.info('Add these to your .env file:');
  console.info('JWT_PRIVATE_KEY=' + Buffer.from(privateKey).toString('base64'));
  console.info('JWT_PUBLIC_KEY=' + Buffer.from(publicKey).toString('base64'));

  return { privateKey, publicKey };
};

generateKeyPair();
