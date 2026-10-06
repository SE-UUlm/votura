import { api } from './api.ts';
import { getAuthLocalStorage } from './authTokens.ts';
import { request } from './requester.ts';

export const deleter = async (url: string): Promise<null> => {
  await request(
    () => {
      const authTokens = getAuthLocalStorage();

      return api.delete(url, {
        headers: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          Accept: 'application/json',
          // eslint-disable-next-line @typescript-eslint/naming-convention
          ...(authTokens ? { Authorization: `Bearer ${authTokens.accessToken}` } : {}),
        },
      });
    },
    'weEncounteredAnUnexpectedErrorWhileDeletingAResourcePleaseTryAgainLaterOrGetInContactWithUs',
    'We encountered an unexpected error while deleting a resource. Please try again later or get in contact with us.',
  );

  return null;
};
