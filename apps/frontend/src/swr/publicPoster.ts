import axios, { AxiosError } from 'axios';
import i18next from 'i18next';
import { hasMessage } from './hasMessage.ts';
import { publicApi } from './publicApi.ts';

/**
 * Posts to an endpoint that does not require authentication.
 *
 * Same behaviour as `poster`, but without the `Authorization` header and
 * against `publicApi`, so that a 401 reaches the caller as an `AxiosError`
 * instead of being swallowed by the auth refresh interceptor.
 */
export const publicPoster = async <T>(url: string, args: { arg: T }): Promise<unknown> => {
  try {
    const response = await publicApi.post(url, args.arg, {
      headers: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        Accept: 'application/json',
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      let errorMessage = '';
      if (error.response?.data !== undefined && hasMessage(error.response.data)) {
        errorMessage = error.response.data.message;
      } else {
        errorMessage = i18next.t(
          'weEncounteredAnUnexpectedErrorWhileCreatingAResourcePleaseTryAgainLaterOrGetInContactWithUs',
          'We encountered an unexpected error while creating a resource. Please try again later or get in contact with us.',
        );
      }
      throw new AxiosError(errorMessage, error.code, error.config, error.request, error.response);
    } else {
      throw error;
    }
  }
};
