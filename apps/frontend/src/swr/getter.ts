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
        // eslint-disable-next-line @typescript-eslint/naming-convention
        ...(authTokens ? { Authorization: `Bearer ${authTokens.accessToken}` } : {}),
      },
    });

    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      let errorMessage: string = '';
      if (error.response?.data !== undefined && hasMessage(error.response.data)) {
        errorMessage = error.response.data.message;
      } else {
        errorMessage = i18next.t(
          'weEncounteredAnUnexpectedErrorWhileFetchingAResourcePleaseTryAgainLaterOrGetInContactWithUs',
          'We encountered an unexpected error while fetching a resource. Please try again later or get in contact with us.',
        );
      }
      throw new AxiosError(errorMessage, error.code, error.config, error.request, error.response);
    } else {
      throw error;
    }
  }
};
