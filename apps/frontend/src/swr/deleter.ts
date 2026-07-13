import axios, { AxiosError } from 'axios';
import i18next from 'i18next';
import { api } from './api.ts';
import { getAuthLocalStorage } from './authTokens.ts';
import { hasMessage } from './hasMessage.ts';

export const deleter = async (url: string): Promise<null> => {
  try {
    const authTokens = getAuthLocalStorage();

    await api.delete(url, {
      headers: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        Accept: 'application/json',
        // eslint-disable-next-line @typescript-eslint/naming-convention
        ...(authTokens ? { Authorization: `Bearer ${authTokens.accessToken}` } : {}),
      },
    });

    return null;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      let errorMessage = '';
      if (error.response?.data !== undefined && hasMessage(error.response.data)) {
        errorMessage = error.response.data.message;
      } else {
        errorMessage = i18next.t(
          'weEncounteredAnUnexpectedErrorWhileDeletingAResourcePleaseTryAgainLaterOrGetInContactWithUs',
          'We encountered an unexpected error while deleting a resource. Please try again later or get in contact with us.',
        );
      }
      throw new AxiosError(errorMessage, error.code, error.config, error.request, error.response);
    } else {
      throw error;
    }
  }
};
