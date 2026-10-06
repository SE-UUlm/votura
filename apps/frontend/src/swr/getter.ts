import { api } from './api.ts';
import { getAuthLocalStorage } from './authTokens.ts';
import { request } from './requester.ts';

export const getter = async (url: string): Promise<unknown> => {
  const response = await request(
    () => {
      const authTokens = getAuthLocalStorage();

      return api.get(url, {
        headers: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          Accept: 'application/json',
          // eslint-disable-next-line @typescript-eslint/naming-convention
          ...(authTokens ? { Authorization: `Bearer ${authTokens.accessToken}` } : {}),
        },
      });
    },
    'weEncounteredAnUnexpectedErrorWhileFetchingAResourcePleaseTryAgainLaterOrGetInContactWithUs',
    'We encountered an unexpected error while fetching a resource. Please try again later or get in contact with us.',
  );

  return response.data;
};
