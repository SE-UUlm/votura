import { api } from './api.ts';
import { getAuthLocalStorage } from './authTokens.ts';
import { request } from './requester.ts';

export const poster = async <T>(url: string, args: { arg: T }): Promise<unknown> => {
  const response = await request(
    () => {
      const authTokens = getAuthLocalStorage();

      return api.post(url, args.arg, {
        headers: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          Accept: 'application/json',
          // eslint-disable-next-line @typescript-eslint/naming-convention
          'Content-Type': 'application/json',
          // eslint-disable-next-line @typescript-eslint/naming-convention
          ...(authTokens ? { Authorization: `Bearer ${authTokens.accessToken}` } : {}),
        },
      });
    },
    'weEncounteredAnUnexpectedErrorWhileCreatingAResourcePleaseTryAgainLaterOrGetInContactWithUs',
    'We encountered an unexpected error while creating a resource. Please try again later or get in contact with us.',
  );

  return response.data;
};
