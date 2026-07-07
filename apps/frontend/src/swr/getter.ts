import axios, { AxiosError } from 'axios';
import i18next from 'i18next';
import { api } from './api.ts';
import { getAuthLocalStorage } from './authTokens.ts';
import { hasMessage } from './hasMessage.ts';

export const getter = async (url: string): Promise<unknown> => {
  try {
    const authTokens = getAuthLocalStorage();

    const response = await api.get(url, {
      headers: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        Accept: 'application/json',
        ...(authTokens
          ? {
              // eslint-disable-next-line @typescript-eslint/naming-convention
              Authorization: i18next.t('bearerAccesstoken', 'Bearer {{accessToken}}', {
                accessToken: authTokens.accessToken,
              }),
            }
          : {}),
      },
    });

    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const errorMessage =
        error.response?.data !== undefined && hasMessage(error.response.data)
          ? error.response.data.message
          : i18next.t(
              'weEncounteredAnUnexpectedErrorWhileFetchingAResourcePleaseTryAgainLaterOrGetInContactWithUs',
              'We encountered an unexpected error while fetching a resource. Please try again later or get in contact with us.',
            );
      throw new AxiosError(errorMessage, error.code, error.config, error.request, error.response);
    } else {
      throw error;
    }
  }
};
